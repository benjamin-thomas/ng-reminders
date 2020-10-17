-- migrate:up
CREATE TABLE api.todos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  , done BOOLEAN NOT NULL DEFAULT FALSE
  , task TEXT NOT NULL
  , due TIMESTAMPTZ
);

GRANT SELECT ON api.todos TO web_anon;

GRANT ALL ON api.todos TO todo_user;
GRANT USAGE, SELECT ON SEQUENCE api.todos_id_seq TO todo_user;

INSERT INTO api.todos (task) VALUES
    ('finish tutorial 0')
  , ('pat self on back');


-- migrate:down
DROP TABLE api.todos;
