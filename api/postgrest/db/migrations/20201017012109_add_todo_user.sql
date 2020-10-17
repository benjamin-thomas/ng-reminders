-- migrate:up
CREATE ROLE todo_user NOLOGIN;
GRANT TODO_USER TO authenticator;

GRANT USAGE ON SCHEMA api TO todo_user;
GRANT ALL ON api.todos TO todo_user;
GRANT USAGE, SELECT ON SEQUENCE api.todos_id_seq TO todo_user;

-- migrate:down
SELECT 1/0
