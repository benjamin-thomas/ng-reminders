-- migrate:up
CREATE ROLE web_anon NOLOGIN;
GRANT web_anon TO authenticator;

CREATE SCHEMA api;
GRANT USAGE ON SCHEMA api TO web_anon;

CREATE ROLE todo_user NOLOGIN;
GRANT todo_user TO authenticator;

GRANT USAGE ON SCHEMA api TO todo_user;

-- migrate:down
SELECT 1/0
