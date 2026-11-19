export function parseMetricRecord(line) {
  try {
    let record = JSON.parse(line);
    if (record?.kind !== "localhost_metric" && typeof record?.message === "string") {
      record = JSON.parse(record.message);
    }
    if (record?.kind !== "localhost_metric" || record.version !== 1 ||
      !["client", "server"].includes(record.origin)) return null;
    const time = Date.parse(record.recordedAt);
    return Number.isFinite(time) && new Date(time).toISOString() === record.recordedAt
      ? { record, time } : null;
  } catch {
    return null;
  }
}
