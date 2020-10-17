-- migrate:up
CREATE SCHEMA api
GRANT USAGE ON SCHEMA api TO web_anon

-- migrate:down
SELECT 1/0
