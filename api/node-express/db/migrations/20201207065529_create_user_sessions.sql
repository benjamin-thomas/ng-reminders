-- migrate:up
-- See: node_modules/connect-pg-simple/table.sql
-- NOTE: singular -> pluralized and minor tweaks
CREATE TABLE sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
	sess JSON NOT NULL,
	expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX sessions_expire_idx ON sessions(expire);
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sessions TO webapp;

-- migrate:down
DROP TABLE sessions;
