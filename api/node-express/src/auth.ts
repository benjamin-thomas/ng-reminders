import {Request, Response} from 'express';

import * as bcrypt from 'bcrypt';

import {mustEnv} from './utils';
import {StatusCodes} from 'http-status-codes';
import * as qry from './db/out/users.queries';
import {pool} from './db/db-conn';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    userId: string; // BIGINT conversion not handled well so keep as string
  }
}

const secret: string = mustEnv('SESSION_SECRET');

const _401_UNAUTHORIZED = StatusCodes.UNAUTHORIZED;

export async function loginAsync(req: Request, res: Response) {
  const errMessage = 'Invalid user or password.';
  const email = req.body.email;
  const password = req.body.password;

  // eslint-disable-next-line camelcase
  console.log({email, password, secret});
  const users = await qry.findUserByEmail.run({email}, pool);

  if (users.length !== 1) {
    return res.status(_401_UNAUTHORIZED).send(errMessage);
  }

  const user = users[0];
  const passwordMatch = await bcrypt.compare(password, user.pw_hash);

  if (!passwordMatch) {
    return res.status(_401_UNAUTHORIZED).send(errMessage);
  }

  req.session.userId = user.id;
  res.send();
}

export function logout(req: Request, res: Response) {
  req.session.destroy(() => {
    res.status(200).end();
  });
}
