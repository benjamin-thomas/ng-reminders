export const mustEnv = (name: string) => {
  const env = process.env[name];
  if (env) return env;

  throw new Error(`Env var not found: ${name}!`);
};

// ?due=lt.2020-12-19T16:47:28 --> where=lt.2020-12-19T16:47:28
export function whereClause(args: any[], where: string, colName: string) {
  let query = '';
  if (!where) return query;

  const [op, val] = where.split('.');
  if (!val) {
    throw new Error(`Invalid syntax (1): ${where}`);
  }

  let safeOp: string; // final operator

  switch (op) {
    case 'lt':
      safeOp = '<';
      break;
    case 'gt':
      safeOp = '>';
      break;
    case 'eq':
      safeOp = '=';
      break;
    default:
      // I'll implement the rest later
      throw new Error(`Invalid syntax (2): ${where}`);
  }
  query += ` WHERE $${args.length + 1} ${safeOp} $${args.length + 2}`;
  args.push(colName, val);
  return query;
}

// Add `LIMIT` and optional `OFFSET` clause
//   Example: http://localhost/resource?limit=10&offset=1
//    Input for limit : 10
//    Input for offset:  1
// eslint-disable-next-line max-len
export function limitOffsetClause(args: any[], limit: number, offset: number) {
  let query = '';
  if (!limit) return query;

  query += ` LIMIT $${args.length + 1}`;
  args.push(limit);
  if (offset) {
    query += ` OFFSET $${args.length + 1}`;
    args.push(offset);
  }
  return query;
}


// Add `ORDER BY` clause
//   Example: http://localhost/resource?order=due.asc,id.desc
//    Input : "due.asc,id.desc"
export function orderClause(args: any[], order: string, authorizedCols: string[]) {
  let query = '';
  if (!order) return query;

  query += ' ORDER BY';
  const items = order.toString().split(',');
  items.forEach((item: string, idx) => {
    const [col, dir] = item.split('.');
    let safeDir;
    if (dir === 'desc') {
      safeDir = 'DESC';
    } else {
      safeDir = 'ASC';
    }
    if (!authorizedCols.includes(col)) {
      throw new Error(`Unauthorized col '${col}', use one of: ${authorizedCols}`);
    }

    query += ` $${args.length + 1} ${safeDir}`;
    const lastPos = idx === (items.length - 1);
    if (!lastPos) {
      query += ',';
    }
    args.push(col);
  });
  return query;
}
