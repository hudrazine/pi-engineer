export function transformLegacyRecord(record) {
  return { id: record.legacyId, value: record.payload };
}
