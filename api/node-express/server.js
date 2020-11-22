
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const utils = require('./utils');
const port = utils.mustEnv('PORT');

const db = require('./queries');

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => {
  res.json({info: 'API server'});
});

app.get('/users', db.getUsers);
app.post('/users', db.createUser);

app.get('/users/:id', db.getUserById);
app.put('/users/:id', db.updateUser);
app.delete('/users/:id', db.deleteUser);

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
