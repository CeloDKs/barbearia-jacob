import { prisma } from "@/lib/db";

export default async function Equipe() {
  const barbeiros = await prisma.barbeiro.findMany({ where: { ativo: true, deletedAt: null } });
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-5xl text-ouro">Nossa equipe</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {barbeiros.map((b) => (
          <div key={b.id} className="rounded-xl border border-zinc-800 bg-grafite/60 p-6">
            {b.foto && <img src={b.foto} alt={b.nome} className="mb-4 h-40 w-full rounded-lg object-cover" />}
            <div className="font-semibold text-zinc-50">{b.nome}</div>
            <div className="text-sm text-ouro">{b.especialidade}</div>
            {b.descricao && <p className="mt-2 text-sm text-zinc-400">{b.descricao}</p>}
            {b.instagram && <p className="mt-2 text-xs text-zinc-500">{b.instagram}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
