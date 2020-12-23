import {pool} from '../db/db-conn';
import {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import {scope} from './reminderHandlers';

export const cypressTestSetup = async (req: Request, res: Response) => {
  const testUserEmail = 'testuser@example.com';
  const testUserPassword = '123';
  const saltRounds = 10;
  const {rows} = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [testUserEmail],
  );
  let user = rows[0];

  if (!user) {
    console.log('Creating test user...');
    const pwHash = await bcrypt.hash(testUserPassword, saltRounds);

    user = await pool.query(
      'INSERT INTO users (email, pw_hash) VALUES ($1, $2) RETURNING *',
      [testUserEmail, pwHash]);
  }

  scope(user.id, 'DELETE FROM reminders');
  res.status(200).send('SETUP OK');
};
