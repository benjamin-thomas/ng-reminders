import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import {mustEnv} from './utils';
import {StatusCodes} from 'http-status-codes';
import * as qry from './queries/users.queries';
import {pool} from './queries/db-conn';

const secret: string = mustEnv('EXPRESS_JWT_SECRET');

const _401_UNAUTHORIZED = StatusCodes.UNAUTHORIZED;

// eslint-disable-next-line require-jsdoc
export async function login(req: any, res: any) {
  const email = req.body.email;
  const password = req.body.password;

  // eslint-disable-next-line camelcase
  const _401_unauthorized = (msg: string) => {
    console.log({msg});
    res.status(_401_UNAUTHORIZED).send();
  };

  console.log({email, password, secret});
  const users = await qry.findUserByEmail.run({email}, pool);

  if (users.length !== 1) {
    return _401_unauthorized('No user or too many users found!');
  }

  const user = users[0];
  const pwHashVar = user.pwHash;

  console.log('***DEBUG (camel=true)***', {user, pwHashVar});
  const passwordMatch = await bcrypt.compare(password, pwHashVar);

  if (!passwordMatch) {
    return _401_unauthorized('No password match!');
  }

  const payload = {email};
  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

  res.cookie('jwt', token, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    // signed: true, /* try later */
  });

  res.send();
}
