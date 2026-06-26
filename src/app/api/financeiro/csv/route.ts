import { sessaoAtual } from "@/lib/session";
import { prisma } from "@/lib/db";
import { toCSV } from "@/lib/csv";
import { toReais } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await sessaoAtual();
  if (!s) return new Response("Não autorizado", { status: 401 });

  const registros = await prisma.registroFinanceiro.findMany({ orderBy: { createdAt: "desc" } });
  const rows = registros.map((r) => ({
    data: r.createdAt.toLocaleDateString("pt-BR"),
    tipo: r.tipo,
    descricao: r.descricao ?? "",
    valor: toReais(r.valor).toFixed(2).replace(".", ","),
  }));

  const csv = toCSV(rows, ["data", "tipo", "descricao", "valor"]);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="financeiro.csv"',
    },
  });
}
