-- migrate:up
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  , email    TEXT NOT NULL
  -- , email    TEXT PRIMARY KEY
  , pw_hash  TEXT NOT NULL CHECK (length(pw_hash) = 60) -- 60=bcrypt
);
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO webapp;
-- migrate:down
DROP TABLE users;
