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
export const scope = async (userID: number, _query: string, args?: any): Promise<QueryResult> => {
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
  const userID = Number(req.session.userId); // null OR Number, incoherent with Chrome's console

  const isDue = req.query.is_due !== undefined; // always bool
  const q = req.query.q as string; // would be undefined otherwise
  // const q = (req.query.q || null) as string; // null or would be 'undefined' otherwise

  const page = Number(req.query.page); // Number OR null
  const perPage = Number(req.query.per_page || 5); // Number OR 3

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

    const qq = q.replace(/\*/g, '%');
    sql += ` content ILIKE $${args.length + 1}`;
    args.push(qq);
  }

  sql += ' ORDER BY due ASC, id DESC';

  // Test pagination, keeping for ref
  // sql = 'SELECT * FROM generate_series(1,100)';

  // Always paginate on first page, at least
  sql += ` LIMIT $${args.length + 1}`;
  args.push(perPage);

  if (page) {
    const offset = (page - 1) * perPage;
    sql += ` OFFSET $${args.length + 1}`;
    args.push(offset);
  }

  const qr: QueryResult = await scope(userID, sql, args);

  res
    .header('Z-DEV-TMP-ROW-COUNT', qr.rowCount.toString())
    .header('Z-DEV-TMP-ROW-SQL', sql)
    .header('Z-DEV-TMP-ROW-SQL-ARGS', args)
    .header('Z-DEV-TMP-ROW-VARS', JSON.stringify({userID, isDue, q, page, perPage}))
  ;

  return res
    .status(200)
    .json({
      items: qr.rows,
      total: qr.rowCount,
    });
};

const _201_CREATED = StatusCodes.CREATED;
const _204_NO_CONTENT = StatusCodes.NO_CONTENT;
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

export const getReminder = async (req: Request, res: Response) => {
  const {rows, rowCount} = await scope(Number(req.session.userId),
    'SELECT * FROM reminders WHERE id = $1 LIMIT 1', [req.params.id]);

  if (rowCount === 0) {
    return res.status(404).send("None, this shouldn't happen!");
  }

  res.status(200).send(rows[0]);
};

export const patchReminder = async (req: Request, res: Response) => {
  const userID = Number(req.session.userId);
  const reminderID = Number(req.params.id);

  let sql = 'UPDATE reminders SET';
  const allowedFields = {
    content: req.body.content,
    done: req.body.done,
    due: req.body.due,
  };

  const args: any[] = [];
  const allowedKeys = Object.keys(allowedFields);
  allowedKeys.forEach((allowedKey) => {
    const allowedInput = req.body[allowedKey];
    if (!allowedInput) {
      return; // skipping empty
    }
    args.push(allowedInput);
    sql += ` ${allowedKey} = $${args.length},`;
  });

  if (args.length === 0) {
    return res.status(_400_BAD_REQUEST).send('Could not process body');
  }

  sql = sql.slice(0, -1); // strip trailing comma

  args.push(reminderID);
  sql += ` WHERE id = $${args.length} RETURNING *`;

  const {rows} = await scope(userID, sql, args);

  res.status(200)
    .header('Z-DEV-TMP-USER-ID', userID.toString())
    .header('Z-DEV-TMP-ROW-SQL', sql)
    .header('Z-DEV-TMP-ROW-ARGS', JSON.stringify(args))
    .json(rows[0]);
};

export const deleteReminder = async (req: Request, res: Response) => {
  const userID = Number(req.session.userId);
  const reminderID = Number(req.params.id);

  await scope(userID,
    'DELETE FROM reminders WHERE id = $1', [reminderID]);

  res.status(_204_NO_CONTENT).end();
};

export const deleteReminders = async (req: Request, res: Response) => {
  const userID = Number(req.session.userId);
  const reminderStrIds = req.query.ids as string;
  const args = reminderStrIds.split(',');

  const inArgs = args.map((_id, n) => `$${n + 1}`).join(', ');
  const sql = `DELETE FROM reminders WHERE id IN (${inArgs})`;

  await scope(userID, sql, args);

  res.status(_204_NO_CONTENT)
    .header('Z-DEV-TMP-USER-ID', userID.toString())
    .header('Z-DEV-TMP-ROW-SQL', sql)
    .header('Z-DEV-TMP-ROW-ARGS', JSON.stringify(args))
    .end();
};
