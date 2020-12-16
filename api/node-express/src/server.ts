import express, {NextFunction, Request, Response} from 'express';
import bodyParser from 'body-parser'; // npm i --save-dev @types/node (I think)
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import {mustEnv} from './utils';
import {pool} from './queries/db-conn';

import {login} from './auth';
import {createUser, deleteUser, getUserById, getUsers, updateUser} from './queries';
import {authenticated} from './middleware';
import csurf from 'csurf';
import cors from 'cors';
import helmet from 'helmet/dist';

const ENV = mustEnv('NODE_ENV');
const PORT = mustEnv('PORT');

const SESSION_SECRET: string = mustEnv('SESSION_SECRET');
const COOKIES_SIGNING_SECRET: string = mustEnv('COOKIES_SIGNING_SECRET');

const ONE_WEEK = 3600 * 24 * 7;
const REQUIRE_RELOGIN_AFTER = ONE_WEEK; // require login after inactivity

const IS_DEV_ENV = ENV === 'development';
const ORIGIN = IS_DEV_ENV ? 'https://ng.reminders.test:4200' : 'TODO';

const app = express();

if (IS_DEV_ENV) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log('****** HEADERS ********');
    console.log(req.headers);
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
  allowedHeaders: ['X-XSRF-TOKEN'],
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
app.get('/csrf', (req: any, res: Response) => {
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
app.post('/csrf', (req: any, res: Response) => {
  req.session.views = (req.session.views || 0) + 1;
  req.session.views += 10;
  res.end();
});

app.post('/login', login);
app.get('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    console.log('session destroyed');
  });
  res.redirect('/');
});

app.get('/', (req: any, res: Response) => {
  req.session.views = (req.session.views || 0) + 1;
  res.json({
    info: 'API server!',
    msg: 'Do view count lookups on server side now!',
    viewCnt: req.session.views,
    csrf: req.csrfToken(),
    session: req.sessionID,
  });
});

app.get('/users', getUsers);
app.post('/users', createUser);

app.get('/users/:id', authenticated, getUserById);
app.patch('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

// Keeping for ref
/*
// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  const xsrfHeader2 = req.headers['x-xsrf-token'] || '';
  console.log({
    xsrfCookie: req.signedCookies['XSRF-TOKEN'],
    xsrfCookie2: req.cookies['XSRF-TOKEN'],
    xsrfHeader: req.headers['X-XSRF-TOKEN'],
    xsrfHeader2: unescape(xsrfHeader2.toString()),
    want: req.csrfToken(),
  });

  // handle CSRF token errors here
  res.status(403);
  res.send('form tampered with');
});
 */

app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});
