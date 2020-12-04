import * as qry from './queries/users.queries';
import * as bcrypt from 'bcrypt';
import {StatusCodes} from 'http-status-codes';
import {pool} from './queries/db-conn';

const _204_NO_CONTENT = StatusCodes.NO_CONTENT;

export const getUsers = async (req: any, res: any) => {
  const users = await qry.findAllUsers.run(undefined, pool);
  res.status(200).json(users);
};

export const getUserById = async (req: any, res: any) => {
  const user = await qry.findUserById.run({userId: req.params.id}, pool);
  if (user.length === 0) {
    return res
      .status(_204_NO_CONTENT)
      .send();
  }
  res.status(200).json(user);
};

const saltRounds = 10; // rounds=10: ~10 hashes/sec on a 2GHz core
export const createUser = async (req: any, res: any) => {
  const {email, password} = req.body;

  const pwHash = await bcrypt.hash(password, saltRounds);

  const p: qry.IInsertUserParams = {email, pwHash};
  const insertResult = await qry.insertUser.run(p, pool);
  const newUser = insertResult[0];
  res.status(201).json(`New userID: ${newUser.id}`);
};

export const updateUser = async (req: any, res: any) => {
  const id: string = req.params.id;
  const {email, password} = req.body;

  let pwHash: string | null;
  if (password) {
    pwHash = await bcrypt.hash(password, saltRounds);
  } else {
    pwHash = null;
  }

  const params: qry.IUpdateUserParams = {id, email, pwHash};
  await qry.updateUser.run(params, pool);

  res.status(200).send(`User modified with ID: ${id}`);
};

export const deleteUser = async (req: any, res: any) => {
  const id = req.params.id;
  await qry.deleteUser.run({id}, pool);

  res.status(200).send(`User deleted with ID: ${id}`);
};
