import {Request, Response} from 'express';

import * as bcrypt from 'bcrypt';

import {mustEnv} from './utils';
import {StatusCodes} from 'http-status-codes';
import * as qry from './queries/users.queries';
import {pool} from './queries/db-conn';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    userId: number;
  }
}

const secret: string = mustEnv('SESSION_SECRET');

const _401_UNAUTHORIZED = StatusCodes.UNAUTHORIZED;

// eslint-disable-next-line require-jsdoc
export async function login(req: Request, res: Response) {
  const email = req.body.email;
  const password = req.body.password;

  // eslint-disable-next-line camelcase
  console.log({email, password, secret});
  const users = await qry.findUserByEmail.run({email}, pool);

  if (users.length !== 1) {
    return res.status(_401_UNAUTHORIZED).send();
  }

  const user = users[0];
  const passwordMatch = await bcrypt.compare(password, user.pw_hash);

  if (!passwordMatch) {
    return res.status(_401_UNAUTHORIZED).send();
  }

  req.session.userId = Number(user.id);
  res.send();
}
