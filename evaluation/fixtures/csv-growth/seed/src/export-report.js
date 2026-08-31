export function exportReport(rows, format) {
  if (format !== "json") throw new RangeError(`unsupported format: ${format}`);
  return JSON.stringify(rows);
}
