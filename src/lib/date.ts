export function formatDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateKey(value: string | null): Date {
  const key = value || formatDateKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    throw new Error("日期格式必须为 YYYY-MM-DD");
  }
  return new Date(`${key}T00:00:00.000Z`);
}
