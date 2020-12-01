import {mustEnv} from './utils';
import {Pool} from 'pg';
import * as db from './queries/users.queries';
import * as bcrypt from 'bcrypt';

const connectionString = mustEnv('DATABASE_URL');

const pool = new Pool({connectionString});

export const getUsers = async (req: any, res: any) => {
  const users = await db.findAllUsers.run(undefined, pool);
  res.status(200).json(users);
};

export const getUserById = async (req: any, res: any) => {
  const user = await db.findUserById.run({userId: req.params.id}, pool);
  res.status(200).json(user);
};

const saltRounds = 10; // rounds=10: ~10 hashes/sec on a 2GHz core
export const createUser = async (req: any, res: any) => {
  const {email, password} = req.body;

  const pwHash = await bcrypt.hash(password, saltRounds);

  const p: db.IInsertUserParams = {email, pwHash};
  const insertResult = await db.insertUser.run(p, pool);
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

  const params: db.IUpdateUserParams = {id, email, pwHash};
  await db.updateUser.run(params, pool);

  res.status(200).send(`User modified with ID: ${id}`);
};

export const deleteUser = async (req: any, res: any) => {
  const id = req.params.id;
  await db.deleteUser.run({id}, pool);

  res.status(200).send(`User deleted with ID: ${id}`);
};
