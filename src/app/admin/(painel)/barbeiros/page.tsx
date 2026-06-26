import { prisma } from "@/lib/db";
import { BarbeirosClient } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function BarbeirosPage() {
  const lista = await prisma.barbeiro.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-zinc-50">Barbeiros</h1>
      <BarbeirosClient inicial={lista} />
    </div>
  );
}
