import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { Card } from "@/components/ui";
import { FaturamentoChart, TopServicosChart } from "@/components/charts";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 font-display text-3xl text-zinc-50">{value}</div>
    </Card>
  );
}

export default async function Dashboard() {
  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [totalClientes, totalAgendamentos, pendentes, entradas, agServicos] = await Promise.all([
    prisma.cliente.count({ where: { deletedAt: null } }),
    prisma.agendamento.count({ where: { deletedAt: null } }),
    prisma.agendamento.count({ where: { deletedAt: null, status: "pendente" } }),
    prisma.registroFinanceiro.findMany({ where: { tipo: "entrada", createdAt: { gte: inicioMes, lt: fimMes } } }),
    prisma.agendamentoServico.findMany({ select: { servicoNome: true } }),
  ]);

  const faturamentoMes = entradas.reduce((a, e) => a + e.valor, 0);

  const porDia = new Map<string, number>();
  for (const e of entradas) {
    const d = String(e.createdAt.getDate()).padStart(2, "0");
    porDia.set(d, (porDia.get(d) ?? 0) + e.valor);
  }
  const faturamentoData = Array.from(porDia.entries()).sort().map(([dia, v]) => ({ dia, valor: v / 100 }));

  const cont = new Map<string, number>();
  for (const a of agServicos) cont.set(a.servicoNome, (cont.get(a.servicoNome) ?? 0) + 1);
  const topServicos = Array.from(cont.entries()).map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-zinc-50">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Faturamento (mês)" value={formatBRL(faturamentoMes)} />
        <Stat label="Agendamentos" value={String(totalAgendamentos)} />
        <Stat label="Pendentes" value={String(pendentes)} />
        <Stat label="Clientes" value={String(totalClientes)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-xl text-zinc-50">Faturamento do mês</h2>
          {faturamentoData.length ? <FaturamentoChart data={faturamentoData} /> : <p className="text-sm text-zinc-500">Sem dados ainda.</p>}
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-xl text-zinc-50">Serviços mais vendidos</h2>
          {topServicos.length ? <TopServicosChart data={topServicos} /> : <p className="text-sm text-zinc-500">Sem dados ainda.</p>}
        </Card>
      </div>
    </div>
  );
}
