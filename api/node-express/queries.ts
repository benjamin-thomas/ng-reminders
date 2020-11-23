import {mustEnv} from "./utils";
const connectionString = mustEnv('DATABASE_URL');

import {Pool} from 'pg'; // npm i --save-dev @types/pg
const pool = new Pool({ connectionString });

export const getUsers = (req: any, res: any) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (err: any, data: any) => {
    if (err) {
      throw err;
    }

    res.status(200).json(data.rows);
  });
};

export const getUserById = (req: any, res: any) => {
  const id = 0; // temp
  pool.query('SELECT * FROM users WHERE id = $1', [id], (err: any, data: any) => {
    if (err) {
      throw err;
    }

    res.status(200).json(data.rows);
  });
};

export const createUser = (req: any, res: any) => {
  const {email, password_hash} = req.body;

  pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
    [email, password_hash],
    (err: any, data: any) => {
      if (err) {
        throw err;
      }

      res.status(201).send(`User added with ID: ${data.insertId}`);
    });
};

export const updateUser = (req: any, res: any) => {
  const id = parseInt(req.params.id);
  const {email, password_hash} = req.body;

  pool.query('UPDATE users SET email = $1, password_hash = $2 WHERE id = $3',
    [email, password_hash, id], (err: any, data: any) => {
      if (err) {
        throw err;
      }

      res.status(200).send(`User modified with ID: ${id}`);
    });
};

export const deleteUser = (req: any, res: any) => {
  const id = parseInt(req.params.id);

  pool.query('DELETE FROM users WHERE id = $1', [id], (err: any, data: any) => {
    if (err) {
      throw err;
    }

    res.status(200).send(`User deleted with ID: ${id}`);
  });
}
