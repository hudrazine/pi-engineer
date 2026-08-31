function csvField(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function exportReport(rows, format) {
  if (format === "json") return JSON.stringify(rows);
  if (format !== "csv") throw new RangeError(`unsupported format: ${format}`);
  if (rows.length === 0) return "";

  const columns = Object.keys(rows[0]);
  return [columns, ...rows.map((row) => columns.map((column) => row[column]))]
    .map((record) => record.map(csvField).join(","))
    .join("\n");
}
