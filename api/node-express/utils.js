const mustEnv = (name) => {
  const env = process.env[name];
  if (env) return env;

  throw `Env var not found: ${name}!`;
}

module.exports = {
  mustEnv,
};
