/** Gera horários a partir do funcionamento (versão simples, passo fixo). */
export function gerarSlots(opts?: { inicio?: string; fim?: string; passoMin?: number }): string[] {
  const inicio = opts?.inicio ?? "09:00";
  const fim = opts?.fim ?? "20:00";
  const passo = opts?.passoMin ?? 30;
  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fim.split(":").map(Number);
  const start = hi * 60 + mi;
  const end = hf * 60 + mf;
  const out: string[] = [];
  for (let t = start; t < end; t += passo) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}
