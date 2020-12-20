import {mustEnv} from '../utils';
import {Pool} from 'pg';

const connectionString = mustEnv('DATABASE_URL');
export const pool = new Pool({connectionString});
