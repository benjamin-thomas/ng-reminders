import express, {NextFunction, Request, Response} from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import csurf from 'csurf';
import cors from 'cors';
import helmet from 'helmet/dist';

import {mustEnv} from './utils';
import {pool} from './db/db-conn';

import {loginAsync} from './auth';
import {createUser, deleteUser, getUserById, getUsers, updateUser} from './handlers/userHandlers';
import {requireAuthentication} from './middleware';
import {createReminder, getReminders} from './handlers/reminderHandlers';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    views?: number;
  }
}

const ENV = mustEnv('NODE_ENV');
const PORT = mustEnv('PORT');

const SESSION_SECRET: string = mustEnv('SESSION_SECRET');
const COOKIES_SIGNING_SECRET: string = mustEnv('COOKIES_SIGNING_SECRET');

const ONE_WEEK = 3600 * 24 * 7;
const REQUIRE_RELOGIN_AFTER = ONE_WEEK; // require login after inactivity

const IS_DEV_ENV = ENV === 'development';
const ORIGIN = IS_DEV_ENV ? 'https://ng.reminders.test:4200' : 'TODO';

const app = express();

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;
/*
 Express does not handle the async/await pattern, so there are 2 options:
   1. Surround any function with a try/catch -> res.status(500) block
   2. Surround the async function with this middleware
 */
const catchAsync = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next);
};

interface ReqError {
  status: number
  message: string
}

const noHtmlErrors = async (err: ReqError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  let payload;
  if (IS_DEV_ENV) {
    payload = {unhandledError: err.message};
  } else {
    payload = {error: 'Something went wrong!'};
  }
  res
    .status(err.status || 555)
    .json(payload);
};


if (IS_DEV_ENV) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log('****** HEADERS START ********');
    console.log(req.headers);
    console.log('****** HEADERS END ********');

    console.log('****** BODY START ********');
    console.log(JSON.stringify(req.body));
    console.log('****** BODY END ********');

    console.log('****** URL START ********');
    console.log({url: req.originalUrl});
    console.log('****** URL END ********');
    next();
  });
}

const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool: pool,
  tableName: 'sessions',
  ttl: REQUIRE_RELOGIN_AFTER, // Specified in seconds. Defaults to maxAge equiv or 24h
});

// Since I'm using an Nginx reverse proxy to establish the TLS connection, this setting is required.
// Otherwise, express-session won't set the cookie with the `secure` flag.
// Oddly, the secured `XSRF-TOKEN` cookie set by cookie-parser does not require this setting.
app.set('trust proxy', 1);

// Security
app.use(helmet());

// Logger
// Available formats: dev, common, short, combined, tiny.
let morganFormat: string;
if (IS_DEV_ENV) {
  morganFormat = 'dev';
} else {
  morganFormat = 'short';
}
app.use(morgan(morganFormat));

app.use(bodyParser.json());
app.use(cookieParser(COOKIES_SIGNING_SECRET));

/*
Must be setup **BEFORE** express-session, otherwise OPTIONS preflight requests will try
to authenticate the user session, and fail (since they won't send the credentials headers)

This middleware creates a "catch-all" OPTIONS endpoint, with the following headers:
  Access-Control-Allow-Origin: ${ORIGIN_VALUE}
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Headers: X-XSRF-TOKEN
  Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
  Vary: Origin

And adds theses headers to every endpoint:
  Access-Control-Allow-Origin: ${ORIGIN_VALUE}
  Access-Control-Allow-Credentials: true
  Vary: Origin
*/
app.use(cors({
  origin: ORIGIN,
  credentials: true,
  allowedHeaders: [
    'X-XSRF-TOKEN',
    'Content-Type', // front end sends application/json
    'Prefer', // Mimic pgrest (count=exact, etc.)
  ],
  exposedHeaders: [ // Angular won't "see" the headers otherwise
    'Content-Range',
  ],
}));

// Returns a session cookie.
// Expiry is set by the sessionStore's ttl.
const normalSession = session({
  name: 'sid', // The default value is 'connect.sid'
  store: sessionStore,
  secret: SESSION_SECRET,
  resave: false, // Do not save if not used on request, connect-pg-simple docs set this to false.

  // False will be the future default it seems, due to cookie consent requirements.
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: true,
    signed: true,
    domain: 'reminders.test',
    sameSite: 'strict', // Default: not sure, "not fully standardized" per the docs.
  },
});

app.use(normalSession);

const csrfProtection = csurf(); // Stores the CSRF secret on the session, server side
app.use(csrfProtection);

// This endpoint will be called by the SPA once, and cache the CSRF token via the cookie once.
app.get('/csrf', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', ORIGIN);
  res.header('Access-Control-Allow-Credentials', 'true');

  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false, // Angular won't be able to grab it if true
    secure: true,

    // Should not sign as csurf will access the unsigned cookie value, but will try to compare
    // this value with the signed X-XSRF-TOKEN/header value (containing a hash/sig).
    //
    // Could be a bug in the csurf library.
    // I cannot workaround this, signing incoming request headers won't work as the generated
    // signed value will differ at that point (something is time based?)
    signed: false,

    domain: 'reminders.test',
    sameSite: 'strict',
  });

  req.session.views = (req.session.views || 0) + 1;
  res.json(`Server side view count: ${req.session.views}`);
});

// Temporary endpoint, to test that the CSRF mechanism is functionnal
app.post('/csrf', (req: Request, res: Response) => {
  req.session.views = (req.session.views || 0) + 1;
  req.session.views += 10;
  res.end();
});

app.post('/login', catchAsync(loginAsync));

app.get('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    console.log('session destroyed');
  });
  res.redirect('/');
});

app.get('/', (req: Request, res: Response) => {
  req.session.views = (req.session.views || 0) + 1;
  res.json({
    info: 'API server!',
    msg: 'Do view count lookups on server side now!',
    viewCnt: req.session.views,
    csrf: req.csrfToken(),
    session: req.sessionID,
  });
});

app.use(requireAuthentication);

app.get('/users', getUsers);
app.post('/users', catchAsync(createUser));
app.get('/users/:id', getUserById);
app.patch('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

app.get('/reminders', catchAsync(getReminders));
app.post('/reminders', catchAsync(createReminder));

app.use(noHtmlErrors);

app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});
