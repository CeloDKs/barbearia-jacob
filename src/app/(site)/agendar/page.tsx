import Wizard from "@/components/Wizard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AgendarPage() {
  const [barbeiros, servicos, combos, cfg] = await Promise.all([
    prisma.barbeiro.findMany({
      where: { ativo: true, deletedAt: null },
      select: { id: true, nome: true, especialidade: true, telefone: true },
    }),
    prisma.servico.findMany({
      where: { ativo: true, deletedAt: null },
      select: { id: true, nome: true, preco: true, duracaoMinutos: true },
      orderBy: { nome: "asc" },
    }),
    prisma.combo.findMany({
      where: { ativo: true, deletedAt: null },
      select: { id: true, nome: true, preco: true },
    }),
    prisma.configuracao.findFirst(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-10 text-center font-display text-5xl text-ouro">Agende seu horário</h1>
      <Wizard
        barbeiros={barbeiros}
        servicos={servicos}
        combos={combos}
        config={{
          nomeBarbearia: cfg?.nomeBarbearia ?? "Barbearia Jacob",
          chavePix: cfg?.chavePix ?? null,
          whatsapp: cfg?.whatsapp ?? null,
        }}
      />
    </div>
  );
}
