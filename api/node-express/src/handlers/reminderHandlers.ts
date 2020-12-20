import {Request, Response} from 'express';
import {pool} from '../db/db-conn';
import {QueryResult} from 'pg';
import {StatusCodes} from 'http-status-codes';
import Joi from 'joi';
import {limitOffsetClause, orderClause, whereClause} from '../utils';

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
  const userID = req.session.userId;
  const q = req.query;

  const limit = Number(q.limit);
  const offset = Number(q.offset);
  const order = q.order as string;
  const due = q.due as string;

  /*
  TODO: check contentRange behavior by spinning a pgrest instance
         contentRange: "0-101/*" --> without any specific count headers
         "content-range" => "0-101/102", --> with header 'Prefer': 'count=exact'
         "content-range" => "4-5/*", --> without header 'Prefer': 'count=exact'
         "content-range" => "4-5/102"
          */


  /*
  Next step:
    Convert this: order=due.asc,id.desc
         To this: 'ORDER BY $1 ASC, $2 DESC', ['due', 'id']

   Ideally, I'd like to implement PGRest's parser:
     - https://github.com/PostgREST/postgrest/blob/master/src/PostgREST/Parsers.hs
     - https://github.com/PostgREST/postgrest/blob/fe09637711c15626aff4ef88c7a4f02e57c2879d/test/Feature/QuerySpec.hs#L574
     - https://github.com/PostgREST/postgrest/blob/fe09637711c15626aff4ef88c7a4f02e57c2879d/src/PostgREST/Types.hs#L396

     - https://gajus.medium.com/parsing-absolutely-anything-in-javascript-using-earley-algorithm-886edcc31e5e
      - https://nearley.js.org/docs/getting-started
     - https://pegjs.org/online
   */
  const prefer = req.header('prefer');

  if (!prefer) {
    throw new Error('Must provide Prefer header!');
  }

  let query = 'SELECT * FROM reminders';
  const args: any[] = [];

  query += whereClause(args, due, 'due');
  query += orderClause(args, order, ['due', 'id']);
  query += limitOffsetClause(args, limit, offset);

  console.log({query, args});

  const {rows, rowCount} = await scope(Number(userID), query, args);
  let tQuery = 'SELECT COUNT(*) AS cnt FROM reminders';
  const tArgs: any[] = [];
  tQuery += whereClause(tArgs, due, 'due');
  const tRes = await scope(Number(userID), tQuery, tArgs);
  const cnt = tRes.rows[0]['cnt'];

  /*
  Mimic the PostgREST API
  For 2 items in total (with Prefer:count=exact)
    1 item should return: Content-Range: 0-0/2 + HTTP 206 Partial Content --> limit=1
    2 items should return: Content-Range: 0-1/2 + 200 OK (all items have been fetched) --> limit=2
    4 items should return:
        Content-Range: 2-3/4 + 206 Partial Content OK (last page) --> limit=2,offset=2
  */

  let rangeEnd = offset + rowCount - 1;
  if (rangeEnd === -1) {
    rangeEnd = 0;
  }
  const contentRange = `${offset}-${rangeEnd}/${cnt}`;
  res.set('Content-Range', contentRange);

  return res
    .status(200)
    .json(rows);
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
    .required()
  ,

  due: Joi.date()
    .optional()
  ,

  done: Joi.boolean()
    .not(Joi.string())
    .required()
  ,
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
