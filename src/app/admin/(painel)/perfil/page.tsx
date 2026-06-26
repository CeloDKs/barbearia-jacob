import { sessaoAtual } from "@/lib/session";
import { PerfilForm } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const s = await sessaoAtual();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-zinc-50">Perfil</h1>
      <PerfilForm email={s?.email ?? ""} />
    </div>
  );
}
