import {mustEnv} from '../utils';
import {Pool, types} from 'pg';

const connectionString = mustEnv('DATABASE_URL');
export const pool = new Pool({connectionString});

/*
 Override:
   https://github.com/brianc/node-pg-types/blob/c4f8c120/lib/textParsers.js#L46

 And cancel the added 'Z' char which messes with Angular's date pipe.
*/
const timeStampOID = types.builtins.TIMESTAMP;
types.setTypeParser(timeStampOID, (val) => val);
