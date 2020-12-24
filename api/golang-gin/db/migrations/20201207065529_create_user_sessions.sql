-- migrate:up
CREATE TABLE sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE INDEX sessions_expire_idx ON sessions(expire);
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sessions TO webapp;

-- migrate:down
DROP TABLE sessions;
