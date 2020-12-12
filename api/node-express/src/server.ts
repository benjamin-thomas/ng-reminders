import express, {Request, Response} from 'express';
import bodyParser from 'body-parser'; // npm i --save-dev @types/node (I think)
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet/dist';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

import {mustEnv} from './utils';
import {pool} from './queries/db-conn';

import {login} from './auth';
import {createUser, deleteUser, getUserById, getUsers, updateUser} from './queries';
import {authenticated} from './middleware';

const app = express();
const port = mustEnv('PORT');
const secret: string = mustEnv('SESSION_SECRET');
const env = mustEnv('NODE_ENV');
console.log({env});

const PgSession = connectPgSimple(session);
const ONE_WEEK = 3600 * 24 * 7; // require login after inactivity
const sessionStore = new PgSession({
  pool: pool,
  tableName: 'sessions',
  ttl: ONE_WEEK, // Specified in seconds. Defaults to maxAge equiv or 24h
});

// Security
app.use(helmet());

// Logger
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(cookieParser());

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
// const csrfProtection = app.use(csurf({cookie: true})); // CSRF protection

// Expiry is set by the sessionStore's ttl
// Returns a session cookie
const normalSession = session({
  name: 'ng-reminders_node-express.sid', // The default value is 'connect.sid'
  store: sessionStore,
  secret: secret,
  resave: false, // do not save if not used on request, connect-pg-simple docs set this to false
  saveUninitialized: false, // false will be future default it seems, due to cookie consent requirements
  cookie: {
    secure: env !== 'development', // Default: false, transmit over SSL only
    httpOnly: true, // Default: true, prevents js from accessing it. Keeping for clarity
    sameSite: 'strict', // Default: not sure, "not fully standardized"
  },
});

const ONE_SECOND = 1000;
// Keeping for ref
// eslint-disable-next-line no-unused-vars
const shortLivedSession = session({
  name: 'ng-reminders_node-express.sid', // The default value is 'connect.sid'
  store: sessionStore,
  secret: secret,
  resave: false, // do not save if not used on request, connect-pg-simple docs set this to false
  saveUninitialized: false, // false will be future default it seems, due to cookie consent requirements
  cookie: {
    secure: env !== 'development', // Default: false, transmit over SSL only
    httpOnly: true, // Default: true, prevents js from accessing it. Keeping for clarity
    sameSite: 'strict', // Default: not sure, "not fully standardized"
    maxAge: 60 * ONE_SECOND, // Overrides pg session's ttl
  },

  rolling: true, // Update cookie with maxAge on every request.
});

app.use(normalSession);

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

//
// const csrfProtection = app.use(csurf({cookie: true})); // CSRF protection
// app.get('/noop', csrfProtection, (req: Request, res: Response) => {
//   res.json('NOOP!');
// });

app.get('/users', getUsers);
app.post('/users', createUser);

app.get('/users/:id', authenticated, getUserById);
app.patch('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
