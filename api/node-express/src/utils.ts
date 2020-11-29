export const mustEnv = (name: string) => {
  const env = process.env[name];
  if (env) return env;

  throw new Error(`Env var not found: ${name}!`);
};

// export default mustEnv;
