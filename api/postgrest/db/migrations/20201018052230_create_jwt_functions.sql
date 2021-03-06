-- migrate:up
-- http://postgrest.org/en/v7.0.0/auth.html?highlight=users#logins
-- https://raw.githubusercontent.com/michelp/pgjwt/master/pgjwt--0.1.0.sql
CREATE EXTENSION pgcrypto;
CREATE SCHEMA jwt;
GRANT USAGE ON SCHEMA jwt TO web_anon;

CREATE OR REPLACE FUNCTION jwt.url_encode(data bytea) RETURNS text LANGUAGE sql AS $$
    SELECT translate(encode(data, 'base64'), E'+/=\n', '-_');
$$;


CREATE OR REPLACE FUNCTION jwt.url_decode(data text) RETURNS bytea LANGUAGE sql AS $$
WITH t AS (SELECT translate(data, '-_', '+/') AS trans),
     rem AS (SELECT length(t.trans) % 4 AS remainder FROM t) -- compute padding size
    SELECT decode(
        t.trans ||
        CASE WHEN rem.remainder > 0
           THEN repeat('=', (4 - rem.remainder))
           ELSE '' END,
    'base64') FROM t, rem;
$$;


CREATE OR REPLACE FUNCTION jwt.algorithm_sign(signables text, secret text, algorithm text)
RETURNS text LANGUAGE sql AS $$
WITH
  alg AS (
    SELECT CASE
      WHEN algorithm = 'HS256' THEN 'sha256'
      WHEN algorithm = 'HS384' THEN 'sha384'
      WHEN algorithm = 'HS512' THEN 'sha512'
      ELSE '' END AS id)  -- hmac throws error
SELECT jwt.url_encode(hmac(signables, secret, alg.id)) FROM alg;
$$;


CREATE OR REPLACE FUNCTION jwt.sign(payload json, secret text, algorithm text DEFAULT 'HS256')
RETURNS text LANGUAGE sql AS $$
WITH
  header AS (
    SELECT jwt.url_encode(convert_to('{"alg":"' || algorithm || '","typ":"JWT"}', 'utf8')) AS data
    ),
  payload AS (
    SELECT jwt.url_encode(convert_to(payload::text, 'utf8')) AS data
    ),
  signables AS (
    SELECT header.data || '.' || payload.data AS data FROM header, payload
    )
SELECT
    signables.data || '.' ||
    jwt.algorithm_sign(signables.data, secret, algorithm) FROM signables;
$$;


CREATE OR REPLACE FUNCTION jwt.verify(token text, secret text, algorithm text DEFAULT 'HS256')
RETURNS table(header json, payload json, valid boolean) LANGUAGE sql AS $$
  SELECT
    convert_from(jwt.url_decode(r[1]), 'utf8')::json AS header,
    convert_from(jwt.url_decode(r[2]), 'utf8')::json AS payload,
    r[3] = jwt.algorithm_sign(r[1] || '.' || r[2], secret, algorithm) AS valid
  FROM regexp_split_to_array(token, '\.') r;
$$;


-- migrate:down
DROP SCHEMA jwt CASCADE;
DROP EXTENSION pgcrypto;
