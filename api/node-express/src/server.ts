import express from 'express';
import bodyParser from 'body-parser'; // npm i --save-dev @types/node (I think)
import {mustEnv} from './utils';
import {createUser, deleteUser, getUserById, getUsers, updateUser} from './queries';

const app = express();
const port = mustEnv('PORT');

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.get('/', (req: any, res: any) => {
  res.json({info: 'API server!'});
});

app.get('/users', getUsers);
app.post('/users', createUser);

app.get('/users/:id', getUserById);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
