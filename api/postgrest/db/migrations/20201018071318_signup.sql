-- migrate:up
-- login should be on your exposed schema
-- Exposes: http POST http://localhost:4444/rpc/signup email=foo1@bar.cam pass=yoz
-- Does not allow duplicate accounts creation
create or replace function api.signup(email text, pass text) returns basic_auth.jwt_token as $$
declare
  _role name;
  result basic_auth.jwt_token;
begin
  INSERT INTO basic_auth.users (email, pass, role) VALUES (email, pass, 'webuser');


  select api.login(email, pass) into result;
  return result;
end;
$$ language plpgsql security definer;


-- migrate:down
SELECT 'NOOP';
