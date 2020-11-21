-- migrate:up
CREATE TABLE reminders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  , email TEXT NOT NULL REFERENCES users(email) DEFAULT current_setting('request.jwt.claim.email')
  , content TEXT NOT NULL
  , done BOOLEAN NOT NULL DEFAULT FALSE
  , due TIMESTAMP WITHOUT TIME ZONE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE reminders TO webapp;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY reminders_policy ON reminders
 USING (email = current_setting('request.jwt.claim.email'));

-- migrate:down
DROP TABLE reminders;