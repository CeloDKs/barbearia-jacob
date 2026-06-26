/** CSV com ; (amigável p/ Excel BR). */
export function toCSV(rows: Record<string, unknown>[], headers?: string[]): string {
  if (!rows.length) return "";
  const cols = headers ?? Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.join(";");
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(";")).join("\n");
  return `\uFEFF${head}\n${body}`;
}
