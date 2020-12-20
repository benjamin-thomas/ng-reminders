import {NextFunction, Request, Response} from 'express';

import * as qry from '../db/out/users.queries';
import * as bcrypt from 'bcrypt';
import {StatusCodes} from 'http-status-codes';
import {pool} from '../db/db-conn';

const _204_NO_CONTENT = StatusCodes.NO_CONTENT;

export const getUsers = async (req: Request, res: Response) => {
  const users = await qry.findAllUsers.run(undefined, pool);

  try {
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send('Could not get user');
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await qry.findUserById.run({userId: req.params.id}, pool);
  if (user.length === 0) {
    return res
      .status(_204_NO_CONTENT)
      .send();
  }
  res.status(200).json(user);
};

export async function getPwHash(req: Request): Promise<string> {
  const saltRounds = 10; // rounds=10: ~10 hashes/sec on a 2GHz core

  console.log('Getting password hash...');
  const {password} = req.body;

  return await bcrypt.hash(password, saltRounds);
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pwHash = await getPwHash(req);

    const {email} = req.body;
    const p: qry.IInsertUserParams = {email, pwHash};
    const insertResult = await qry.insertUser.run(p, pool);
    const newUser = insertResult[0];
    res.status(201).json(`New userID: ${newUser.id}`);
  } catch (err) {
    // res.send(500).send('Could not create user!');
    next(new Error('Could not create user!'));
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const {email, password} = req.body;

  let pwHash: string | null;
  if (password) {
    pwHash = await getPwHash(req);
  } else {
    pwHash = null;
  }

  const params: qry.IUpdateUserParams = {id, email, pwHash};
  await qry.updateUser.run(params, pool);

  res.status(200).send(`User modified with ID: ${id}`);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  await qry.deleteUser.run({id}, pool);

  res.status(200).send(`User deleted with ID: ${id}`);
};
