export function parseLimit(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new RangeError("limit must be an integer from 1 to 100");
  }
  return parsed;
}
