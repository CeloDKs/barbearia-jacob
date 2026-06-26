import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/money";

export default async function Home() {
  const [servicos, barbeiros] = await Promise.all([
    prisma.servico.findMany({ where: { ativo: true, deletedAt: null }, take: 3, orderBy: { preco: "asc" } }),
    prisma.barbeiro.findMany({ where: { ativo: true, deletedAt: null }, take: 3 }),
  ]);

  return (
    <>
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-28 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-ouro">A Capital do Estilo</p>
          <h1 className="font-display text-6xl leading-none text-zinc-50 md:text-8xl">BARBEARIA JACOB</h1>
          <p className="mx-auto mt-6 max-w-xl text-zinc-400">
            Corte, barba e atitude. Agende em segundos e garanta seu horário com o melhor da casa.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/agendar" className="rounded-md bg-ouro px-6 py-3 font-semibold text-carvao transition hover:bg-ouro-400">
              Agendar agora
            </Link>
            <Link href="/loja" className="rounded-md border border-zinc-700 px-6 py-3 font-semibold text-zinc-100 transition hover:border-ouro hover:text-ouro">
              Ver loja
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl text-zinc-50">Serviços</h2>
          <Link href="/servicos" className="text-sm text-ouro hover:underline">ver todos</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {servicos.map((s) => (
            <div key={s.id} className="rounded-xl border border-zinc-800 bg-grafite/60 p-6">
              <div className="font-display text-2xl text-zinc-50">{s.nome}</div>
              <p className="mt-1 text-sm text-zinc-400">{s.descricao ?? `${s.duracaoMinutos} min`}</p>
              <div className="mt-4 text-xl font-semibold text-ouro">{formatBRL(s.preco)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl text-zinc-50">Equipe</h2>
          <Link href="/equipe" className="text-sm text-ouro hover:underline">conheça</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {barbeiros.map((b) => (
            <div key={b.id} className="rounded-xl border border-zinc-800 bg-grafite/60 p-6">
              <div className="font-semibold text-zinc-50">{b.nome}</div>
              <div className="text-sm text-ouro">{b.especialidade}</div>
              {b.descricao && <p className="mt-2 text-sm text-zinc-400">{b.descricao}</p>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
