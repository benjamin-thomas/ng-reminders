import express from 'express';
import bodyParser from 'body-parser'; // npm i --save-dev @types/node (I think)
import cookieParser from 'cookie-parser';
import {mustEnv} from './utils';

import {login} from './auth';
import {createUser, deleteUser, getUserById, getUsers, updateUser} from './queries';

const app = express();
const port = mustEnv('PORT');

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.post('/login', login);

app.get('/', (req: any, res: any) => {
  res.json({info: 'API server!'});
});

app.get('/users', getUsers);
app.post('/users', createUser);

app.get('/users/:id', getUserById);
app.patch('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
