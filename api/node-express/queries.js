const utils = require('./utils');
connectionString = utils.mustEnv('DATABASE_URL');

const Pool = require('pg').Pool;
const pool = new Pool({ connectionString });

const getUsers = (req, res) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (err, data) => {
    if (err) {
      throw err;
    }

    res.status(200).json(data.rows);
  });
};

const getUserById = (req, res) => {
  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, data) => {
    if (err) {
      throw err;
    }

    res.status(200).json(data.rows);
  });
};

const createUser = (req, res) => {
  const {email, password_hash} = request.body;

  pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
    [email, password_hash],
    (err, data) => {
      if (err) {
        throw err;
      }

      res.status(201).send(`User added with ID: ${data.insertId}`);
    });
};

const updateUser = (req, res) => {
  const id = parseInt(request.params.id);
  const {email, password_hash} = request.body;

  pool.query('UPDATE users SET email = $1, password_hash = $2 WHERE id = $3',
    [email, password_hash, id], (err, data) => {
      if (err) {
        throw err;
      }

      res.status(200).send(`User modified with ID: ${id}`);
    });
};

const deleteUser = (req, res) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM users WHERE id = $1', [id], (err, data) => {
    if (err) {
      throw err;
    }

    res.status(200).send(`User deleted with ID: ${id}`);
  });
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}
