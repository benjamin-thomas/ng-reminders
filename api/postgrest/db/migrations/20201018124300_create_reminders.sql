-- migrate:up
GRANT webuser TO authenticator;
GRANT USAGE ON SCHEMA api TO webuser;

CREATE TABLE api.reminders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  , email TEXT NOT NULL REFERENCES basic_auth.users(email) DEFAULT current_setting('request.jwt.claim.email')
  , content TEXT NOT NULL
);
ALTER TABLE api.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY reminders_policy ON api.reminders
 USING (email = current_setting('request.jwt.claim.email'));

GRANT ALL ON api.reminders TO webuser;

-- migrate:down
DROP TABLE api.reminders;
DROP ROLE webuser;
