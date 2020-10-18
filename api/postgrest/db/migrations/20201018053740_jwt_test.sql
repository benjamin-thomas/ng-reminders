-- migrate:up
CREATE TYPE jwt_token AS (
  token text
);

-- Exposes API call /rpc/jwt_test
-- http://postgrest.org/en/v7.0.0/auth.html?highlight=users#logins
CREATE FUNCTION api.jwt_test() RETURNS public.jwt_token AS $$
  SELECT jwt.sign(
    row_to_json(r), (SELECT current_setting('app.jwt_secret'))
  ) AS token
  FROM (
    SELECT
      'my_role'::TEXT AS role,
      extract(EPOCH FROM now())::INTEGER + 300 AS exp
  ) r;
$$ LANGUAGE sql;


-- migrate:down
DROP FUNCTION api.jwt_test;
DROP TYPE jwt_token;
