/* @name FindUserById */
SELECT * FROM users WHERE id = :userId;

/* @name FindUserByEmail */
SELECT * FROM users WHERE email = :email;

/* @name FindAllUsers */
SELECT * FROM users;

/* @name InsertUser */
INSERT INTO users (email, pw_hash) VALUES (:email, :pwHash) RETURNING id;

/* @name UpdateUser */
UPDATE users
   SET email = COALESCE(:email, email)
     , pw_hash = COALESCE(:pwHash, pw_hash)
 WHERE id = :id;

/* @name DeleteUser */
DELETE FROM users WHERE id = :id;
