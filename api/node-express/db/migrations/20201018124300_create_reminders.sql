-- migrate:up
CREATE TABLE reminders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  , user_id BIGINT NOT NULL REFERENCES users(id) DEFAULT current_setting('app.user_id')::BIGINT
  , content TEXT NOT NULL
  , done BOOLEAN NOT NULL DEFAULT FALSE
  , due TIMESTAMP WITHOUT TIME ZONE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE reminders TO webapp;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY reminders_policy ON reminders
 USING (user_id = current_setting('app.user_id')::BIGINT);

-- migrate:down
DROP TABLE reminders;
