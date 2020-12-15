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
import csurf from 'csurf';

const app = express();
const port = mustEnv('PORT');
const sessionSecret: string = mustEnv('SESSION_SECRET');
const cookiesSigningSecret: string = mustEnv('COOKIES_SIGNING_SECRET');

const PgSession = connectPgSimple(session);
const ONE_WEEK = 3600 * 24 * 7; // require login after inactivity

const sessionStore = new PgSession({
  pool: pool,
  tableName: 'sessions',
  ttl: ONE_WEEK, // Specified in seconds. Defaults to maxAge equiv or 24h
});

// Since I'm using an nginx reverse proxy to establish the TLS connection, this setting is required.
// Otherwise, express-session won't set the cookie with the `secure` flag.
// Oddly, the secured `XSRF-TOKEN` cookie set by cookie-parser does not require this setting.
app.set('trust proxy', 1);

// Security
app.use(helmet());

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
    secure: true,
    signed: true,
    domain: 'reminders.test',
    sameSite: 'strict', // Default: not sure, "not fully standardized"
  },
});

app.use(normalSession);

const csrfProtection = csurf(); // Stores the CSRF secret on the session, server side
app.use(csrfProtection);

const ENV = mustEnv('NODE_ENV');
const ORIGIN = ENV === 'development' ? 'https://ng.reminders.test:4200' : 'TODO';

// This endpoint will be called by the SPA once
app.get('/csrf', (req: any, res: Response) => {
  res.header('Access-Control-Allow-Origin', ORIGIN);
  res.header('Access-Control-Allow-Credentials', 'true');

  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: true,
    secure: true,
    signed: true,
    domain: 'reminders.test',
    sameSite: 'strict',
  });

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
