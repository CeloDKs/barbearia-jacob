import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";

export default async function Loja() {
  const produtos = await prisma.produto.findMany({ where: { ativo: true, deletedAt: null } });
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-5xl text-ouro">Loja</h1>
      <p className="mt-2 text-zinc-400">Produtos selecionados para manter seu estilo em casa.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {produtos.map((p) => (
          <div key={p.id} className="rounded-xl border border-zinc-800 bg-grafite/60 p-4">
            {p.imagens?.[0] && <img src={p.imagens[0]} alt={p.nome} className="mb-3 h-36 w-full rounded-lg object-cover" />}
            <div className="font-medium text-zinc-50">{p.nome}</div>
            <div className="text-xs text-zinc-500">{p.categoria}</div>
            <div className="mt-2 font-semibold text-ouro">{formatBRL(p.preco)}</div>
          </div>
        ))}
        {produtos.length === 0 && <p className="text-zinc-500">Em breve novos produtos.</p>}
      </div>
    </div>
  );
}
