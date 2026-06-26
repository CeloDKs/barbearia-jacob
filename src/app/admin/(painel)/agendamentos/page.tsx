import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import { formatDataBR } from "@/lib/format";
import { Card } from "@/components/ui";
import { StatusSelect } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function Agendamentos() {
  const ags = await prisma.agendamento.findMany({
    where: { deletedAt: null },
    include: { cliente: true, barbeiro: true, servicos: true, combos: true },
    orderBy: [{ data: "desc" }, { horario: "desc" }],
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-zinc-50">Agendamentos</h1>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="pb-2">Data</th><th>Hora</th><th>Cliente</th><th>Barbeiro</th>
              <th>Serviços</th><th>Total</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ags.map((a) => (
              <tr key={a.id} className="border-t border-zinc-800 align-top">
                <td className="py-2">{formatDataBR(a.data)}</td>
                <td>{a.horario}</td>
                <td>
                  <div className="font-medium">{a.cliente.nomeCompleto}</div>
                  <div className="text-xs text-zinc-500">{a.cliente.telefone}</div>
                </td>
                <td>{a.barbeiro.nome}</td>
                <td className="max-w-[220px] text-xs text-zinc-400">
                  {[...a.servicos.map((s) => s.servicoNome), ...a.combos.map((c) => c.comboNome)].join(", ")}
                </td>
                <td className="text-ouro">{formatBRL(a.valorTotal)}</td>
                <td><StatusSelect id={a.id} status={a.status} /></td>
              </tr>
            ))}
            {ags.length === 0 && <tr><td colSpan={7} className="py-4 text-zinc-500">Nenhum agendamento.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
