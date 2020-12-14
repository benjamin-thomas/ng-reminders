import express, {Request, Response} from 'express';
import bodyParser from 'body-parser'; // npm i --save-dev @types/node (I think)
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet/dist';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// Blog, to read (many articles)
// https://flaviocopes.com/express-https-self-signed-certificate/

import {mustEnv} from './utils';
import {pool} from './queries/db-conn';

import {login} from './auth';
import {createUser, deleteUser, getUserById, getUsers, updateUser} from './queries';
import {authenticated} from './middleware';
import csurf from 'csurf';

const app = express();
const port = mustEnv('PORT');
const sessionSecret: string = mustEnv('SESSION_SECRET');
const cookiesSigningSecret: string = mustEnv('COOKIES_SIGNING_SECRET');
const env = mustEnv('NODE_ENV');
console.log({env});

const PgSession = connectPgSimple(session);
const ONE_WEEK = 3600 * 24 * 7; // require login after inactivity
const sessionStore = new PgSession({
  pool: pool,
  tableName: 'sessions',
  ttl: ONE_WEEK, // Specified in seconds. Defaults to maxAge equiv or 24h
});

app.set('trust proxy', 1); // trust first proxy
const notDevEnv = env !== 'development';

// Security
if (notDevEnv) {
  app.use(helmet());
}

// Logger
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(cookieParser(cookiesSigningSecret));

// Expiry is set by the sessionStore's ttl
// Returns a session cookie
const normalSession = session({
  name: 'sid', // The default value is 'connect.sid'
  store: sessionStore,
  secret: sessionSecret,
  resave: false, // do not save if not used on request, connect-pg-simple docs set this to false

  // false will be future default it seems, due to cookie consent requirements
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    // secure: notDevEnv,
    secure: true,
    signed: true,
    domain: 'reminders.test',
    sameSite: 'strict', // Default: not sure, "not fully standardized"
  },
});

app.use(normalSession);

// https://www.npmjs.com/package/csurf
/*
cookie
Determines if the token secret for the user should be stored in a cookie or in req.session.
Storing the token secret in a cookie implements the double submit cookie pattern. Defaults to false.

When set to true (or an object of options for the cookie),
then the module changes behavior and no longer uses req.session.
This means you are no longer required to use a session middleware.
Instead, you do need to use the cookie-parser middleware in your app before this middleware.
 */
const csrfProtection = csurf(); // Stores the CSRF secret on the session, server side
app.use(csrfProtection);

// This endpoint will be called by the SPA once
app.get('/csrf', (req: any, res: Response) => {
  console.log({csrf: req.csrfToken()});
  // res.header('XSRF-TOKEN', req.csrfToken());
  // res.header('Access-Control-Expose-Headers', 'XSRF-TOKEN');
  res.header('Access-Control-Allow-Origin', 'https://ng.reminders.test:4200');
  res.header('Access-Control-Allow-Credentials', 'true');
  // res.header('Allow-Origin-With-Credentials', 'true');

  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: true,
    secure: notDevEnv,
    signed: true,
    domain: 'reminders.test',
    sameSite: 'strict',
  }); // This would be for Angular

  req.session.views = (req.session.views || 0) + 1;
  res.json(`Server side view count: ${req.session.views}`);
});

// This endpoint is just for testing
app.post('/csrf', (req: Request, res: Response) => {
  res.send('OK!');
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

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
