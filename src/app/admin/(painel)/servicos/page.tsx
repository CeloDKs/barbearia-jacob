import { prisma } from "@/lib/db";
import { ServicosClient } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function ServicosPage() {
  const lista = await prisma.servico.findMany({ where: { deletedAt: null }, orderBy: { nome: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-zinc-50">Serviços</h1>
      <ServicosClient inicial={lista} />
    </div>
  );
}
