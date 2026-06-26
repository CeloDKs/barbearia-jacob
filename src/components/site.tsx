import Link from "next/link";
import { prisma } from "@/lib/db";

const NAV: [string, string][] = [
  ["/", "Início"],
  ["/servicos", "Serviços"],
  ["/equipe", "Equipe"],
  ["/loja", "Loja"],
  ["/sobre", "Sobre"],
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-carvao/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-2xl tracking-wider text-ouro">
          BARBEARIA JACOB
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="text-sm text-zinc-300 transition hover:text-ouro">
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/agendar"
          className="rounded-md bg-ouro px-4 py-2 text-sm font-semibold text-carvao transition hover:bg-ouro-400"
        >
          Agendar
        </Link>
      </div>
    </header>
  );
}

export async function Footer() {
  const cfg = await prisma.configuracao.findFirst();
  const wa = cfg?.whatsapp?.replace(/\D/g, "");
  const ig = cfg?.instagram?.replace("@", "");
  return (
    <footer className="mt-24 border-t border-zinc-800 bg-grafite/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl text-ouro">{cfg?.nomeBarbearia ?? "Barbearia Jacob"}</div>
          <p className="mt-3 text-sm text-zinc-400">{cfg?.endereco ?? "—"}</p>
        </div>
        <div className="text-sm text-zinc-400">
          <div className="mb-2 font-semibold text-zinc-200">Funcionamento</div>
          <p>{cfg?.horarioFuncionamento ?? "—"}</p>
        </div>
        <div className="space-y-1 text-sm text-zinc-400">
          <div className="mb-2 font-semibold text-zinc-200">Contato</div>
          {wa && (
            <a className="block transition hover:text-ouro" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          )}
          {ig && (
            <a className="block transition hover:text-ouro" href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">
              @{ig}
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        Sistema desenvolvido com ❤️ para a Barbearia Jacob — A Capital do Estilo
      </div>
    </footer>
  );
}
