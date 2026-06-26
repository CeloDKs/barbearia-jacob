import { prisma } from "@/lib/db";
import { ConfigForm } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const cfg = await prisma.configuracao.findFirst();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-zinc-50">Configurações</h1>
      <ConfigForm
        cfg={{
          nomeBarbearia: cfg?.nomeBarbearia ?? "Barbearia Jacob",
          whatsapp: cfg?.whatsapp ?? "",
          instagram: cfg?.instagram ?? "",
          endereco: cfg?.endereco ?? "",
          horarioFuncionamento: cfg?.horarioFuncionamento ?? "",
          chavePix: cfg?.chavePix ?? "",
          logo: cfg?.logo ?? "",
          tema: cfg?.tema ?? "dark",
        }}
      />
    </div>
  );
}
