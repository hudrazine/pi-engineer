export function parseBoundedInteger(value, { name, min, max }) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new RangeError(`${name} must be an integer from ${min} to ${max}`);
  }
  return parsed;
}

export function loadConfig(env) {
  return {
    port: parseBoundedInteger(env.PORT ?? "3000", {
      name: "PORT",
      min: 1,
      max: 65535,
    }),
  };
}
