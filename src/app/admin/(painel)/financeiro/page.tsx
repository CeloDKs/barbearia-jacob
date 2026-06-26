import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { formatDataBR } from "@/lib/format";
import { Card } from "@/components/ui";
import { DespesaForm, PrintButton } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

function Stat({ label, value, cor }: { label: string; value: string; cor: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-1 font-display text-3xl ${cor}`}>{value}</div>
    </Card>
  );
}

export default async function Financeiro() {
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const registros = await prisma.registroFinanceiro.findMany({
    where: { createdAt: { gte: inicioMes, lt: fimMes } },
    orderBy: { createdAt: "desc" },
  });

  const receitas = registros.filter((r) => r.tipo === "entrada").reduce((a, r) => a + r.valor, 0);
  const despesas = registros.filter((r) => r.tipo === "saida").reduce((a, r) => a + r.valor, 0);
  const lucro = receitas - despesas;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl text-zinc-50">Financeiro</h1>
        <div className="flex gap-2">
          <a href="/api/financeiro/csv" className="no-print rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-100 hover:border-ouro hover:text-ouro">
            Exportar CSV
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Receitas (mês)" value={formatBRL(receitas)} cor="text-emerald-400" />
        <Stat label="Despesas (mês)" value={formatBRL(despesas)} cor="text-red-400" />
        <Stat label="Lucro (mês)" value={formatBRL(lucro)} cor="text-ouro" />
      </div>

      <Card className="no-print"><DespesaForm /></Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-zinc-500">
            <tr><th className="pb-2">Data</th><th>Tipo</th><th>Descrição</th><th className="text-right">Valor</th></tr>
          </thead>
          <tbody>
            {registros.map((r) => (
              <tr key={r.id} className="border-t border-zinc-800">
                <td className="py-2">{formatDataBR(r.createdAt)}</td>
                <td className={r.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}>{r.tipo}</td>
                <td className="text-zinc-300">{r.descricao}</td>
                <td className="text-right">{formatBRL(r.valor)}</td>
              </tr>
            ))}
            {registros.length === 0 && <tr><td colSpan={4} className="py-4 text-zinc-500">Sem lançamentos no mês.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
