-- migrate:up
-- http://postgrest.org/en/v7.0.0/auth.html?highlight=users#public-user-interface
-- add type
CREATE TYPE basic_auth.jwt_token AS (
  token text
);

-- login should be on your exposed schema
create or replace function api.login(email text, pass text) returns basic_auth.jwt_token as $$
declare
  _role name;
  result basic_auth.jwt_token;
begin
  -- check email and password
  select basic_auth.user_role(email, pass) into _role;
  if _role is null then
    raise invalid_password using message = 'invalid user or password';
  end if;

  select jwt.sign(
      row_to_json(r), (SELECT current_setting('app.jwt_secret'))
    ) as token
    from (
      select _role as role, login.email as email,
         extract(epoch from now())::integer + 60 as exp -- 60s, or 60*60 for 1h
    ) r
    into result;
  return result;
end;
$$ language plpgsql security definer;

CREATE ROLE webuser NOINHERIT NOLOGIN;
-- Then create users as postgres that way
INSERT INTO basic_auth.users (email, pass, role) VALUES ('user1@example.com', 'yo', 'webuser');
INSERT INTO basic_auth.users (email, pass, role) VALUES ('user2@example.com', 'yo', 'webuser');
-- And login that way
-- http POST http://localhost:4444/rpc/login email=foo@bar.com pass=yoz

-- migrate:down
SELECT 1/0;
