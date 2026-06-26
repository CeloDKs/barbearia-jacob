import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";
import Link from "next/link";

export default async function Servicos() {
  const servicos = await prisma.servico.findMany({
    where: { ativo: true, deletedAt: null }, orderBy: { preco: "asc" },
  });
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-5xl text-ouro">Serviços</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {servicos.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-grafite/60 p-6">
            <div>
              <div className="font-display text-2xl text-zinc-50">{s.nome}</div>
              <p className="text-sm text-zinc-400">{s.descricao ?? `${s.duracaoMinutos} min`}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-ouro">{formatBRL(s.preco)}</div>
              <div className="text-xs text-zinc-500">{s.duracaoMinutos} min</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/agendar" className="rounded-md bg-ouro px-6 py-3 font-semibold text-carvao hover:bg-ouro-400">Agendar</Link>
      </div>
    </div>
  );
}
