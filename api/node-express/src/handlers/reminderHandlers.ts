import {Request, Response} from 'express';
import {pool} from '../db/db-conn';
import {QueryResult} from 'pg';
import {StatusCodes} from 'http-status-codes';
import Joi from 'joi';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    userId: string; // BIGINT conversion not handled well so keep as string
  }
}

/*
 Scopes the query to the userID context (RLS)

 NOTE: Since I'm using a connection pool, it's important not to use `pool.query`.
       And not use `SET app.my_var` which is global to the long living connection.
       Otherwise, I risk triggering a race condition where one query sets the userID,
       while another user's request is running, and potentially returning wrong rows.

       So the best strategy I can think of for now is to wrap the user query inside a
       transaction, and use `SET LOCAL` which requires a transaction block.
 */
const scope = async (userID: number, _query: string, args?: any): Promise<QueryResult> => {
  if (!userID) {
    // eslint-disable-next-line max-len
    throw new Error('This should never happen!!'); // At least in prod. Guards against app crash in dev.
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Cannot use a parameterized query here.
    // But since I'm limiting the input to a Number type, I think it's ok.
    // Also further limited by the fact that no user can set a bogus userID inside its session
    // store.
    await client.query(`SET LOCAL app.user_id = ${userID}`);

    const ret = client.query(_query, args);
    await client.query('COMMIT');
    return ret;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const getReminders = async (req: Request, res: Response) => {
  const userID = Number(req.session.userId);

  const isDue = req.query.is_due !== undefined;
  const q = req.query.q as string;

  let sql = 'SELECT * FROM reminders';
  const args: any[] = [];
  const now = new Date();
  if (isDue) {
    sql += ` WHERE due < $${args.length + 1}`;
    args.push(now);
  }

  if (q) {
    if (args.length === 0) {
      sql += ' WHERE';
    } else {
      sql += ' AND';
    }

    sql += ` content ILIKE $${args.length + 1}`;
    args.push(`%${q}%`);
  }

  sql += ' ORDER BY due ASC, id DESC';

  const qr: QueryResult = await scope(userID, sql, args);

  return res
    .status(200)
    .json({
      rows: qr.rows,
      zSQL: sql,
      zSQLArgs: args,
      zVars: {userID, isDue, q},
    });
};

const _201_CREATED = StatusCodes.CREATED;
const _400_BAD_REQUEST = StatusCodes.BAD_REQUEST;

function badRequest(res: Response, msg: string) {
  return res
    .status(_400_BAD_REQUEST)
    .send(msg);
}

const createSchema = Joi.object({
  content: Joi.string()
    .min(3)
    .max(100)
    .required(),

  due: Joi.date()
    .optional(),

  done: Joi.boolean()
    .not(Joi.string())
    .required(),
});
export const createReminder = async (req: Request, res: Response) => {
  const value = await createSchema.validateAsync(req.body);
  const {content, due, done} = value;

  console.log(`done type: ${typeof done}`);
  console.log(`req body: ${JSON.stringify(req.body)}`);

  if (typeof done !== 'boolean') {
    return badRequest(res, 'Must set done');
  }

  if (typeof content !== 'string') {
    return badRequest(res, 'Wrong content value');
  }

  await scope(
    Number(req.session.userId),
    'INSERT INTO reminders (content, due, done) VALUES ($1, $2, $3)',
    [content, due, done]);

  return res
    .status(_201_CREATED)
    .end();
};
