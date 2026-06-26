import Link from "next/link";
import { redirect } from "next/navigation";
import { sessaoAtual } from "@/lib/session";
import { logout } from "@/lib/actions";

const NAV: [string, string][] = [
  ["/admin", "Dashboard"],
  ["/admin/agendamentos", "Agendamentos"],
  ["/admin/barbeiros", "Barbeiros"],
  ["/admin/servicos", "Serviços"],
  ["/admin/financeiro", "Financeiro"],
  ["/admin/configuracoes", "Configurações"],
  ["/admin/perfil", "Perfil"],
];

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-800 bg-grafite/40 p-4 md:flex">
        <Link href="/admin" className="mb-8 font-display text-2xl text-ouro">JACOB ADMIN</Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-ouro">
              {label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400">
            Sair
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 md:hidden">
          <Link href="/admin" className="font-display text-xl text-ouro">JACOB ADMIN</Link>
          <form action={logout}><button className="text-sm text-zinc-400">Sair</button></form>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-zinc-800 px-4 py-2 md:hidden">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded px-3 py-1 text-xs text-zinc-300">{label}</Link>
          ))}
        </nav>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
