export function soDigitos(v: string): string {
  return (v ?? "").replace(/\D/g, "");
}

export function maskTelefone(v: string): string {
  const d = soDigitos(v).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function nomeValido(nome: string): boolean {
  const limpo = (nome ?? "").trim();
  if (/\d/.test(limpo)) return false;
  return limpo.split(/\s+/).filter(Boolean).length >= 2;
}

export function telefoneWhatsappValido(v: string): boolean {
  const d = soDigitos(v);
  return d.length === 10 || d.length === 11;
}

export function formatDataBR(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(date);
}
