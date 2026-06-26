"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  atualizarStatusAgendamento,
  salvarBarbeiro,
  excluirBarbeiro,
  salvarServico,
  excluirServico,
  lancarDespesa,
  salvarConfig,
  trocarSenha,
} from "@/lib/actions";
import { Button, Input, Textarea, Label, Card } from "@/components/ui";
import { formatBRL } from "@/lib/money";

const STATUS = ["pendente", "confirmado", "concluido", "cancelado"] as const;

export function PrintButton({ children = "Imprimir / Salvar PDF" }: { children?: ReactNode }) {
  return (
    <Button variant="outline" className="no-print" onClick={() => window.print()}>
      {children}
    </Button>
  );
}

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [val, setVal] = useState(status);
  const [pending, start] = useTransition();
  return (
    <select
      value={val}
      disabled={pending}
      onChange={(e) => {
        const s = e.target.value as (typeof STATUS)[number];
        setVal(s);
        start(async () => {
          await atualizarStatusAgendamento(id, s);
          router.refresh();
        });
      }}
      className="rounded-md border border-zinc-700 bg-grafite px-2 py-1 text-xs capitalize text-zinc-100"
    >
      {STATUS.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

// ─────────────── BARBEIROS ───────────────
type Barbeiro = {
  id: string; nome: string; especialidade: string | null; telefone: string | null;
  instagram: string | null; foto: string | null; descricao: string | null; ativo: boolean;
};
const barbeiroVazio = { nome: "", especialidade: "", telefone: "", instagram: "", foto: "", descricao: "", ativo: true };

export function BarbeirosClient({ inicial }: { inicial: Barbeiro[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...barbeiroVazio });
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const novo = () => { setEditId(null); setForm({ ...barbeiroVazio }); setErro(""); };
  function editar(b: Barbeiro) {
    setEditId(b.id);
    setForm({
      nome: b.nome, especialidade: b.especialidade ?? "", telefone: b.telefone ?? "",
      instagram: b.instagram ?? "", foto: b.foto ?? "", descricao: b.descricao ?? "", ativo: b.ativo,
    });
  }

  function salvar() {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)));
    start(async () => {
      const r = await salvarBarbeiro(editId, fd);
      if (r?.erro) return setErro(r.erro);
      novo(); router.refresh();
    });
  }
  const excluir = (id: string) =>
    start(async () => { await excluirBarbeiro(id); router.refresh(); });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-zinc-500">
            <tr><th className="pb-2">Nome</th><th>Especialidade</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {inicial.map((b) => (
              <tr key={b.id} className="border-t border-zinc-800">
                <td className="py-2 font-medium">{b.nome}</td>
                <td className="text-zinc-400">{b.especialidade}</td>
                <td>{b.ativo ? "Ativo" : "Inativo"}</td>
                <td className="text-right">
                  <button className="text-ouro hover:underline" onClick={() => editar(b)}>editar</button>
                  <button className="ml-3 text-red-400 hover:underline" onClick={() => excluir(b.id)}>excluir</button>
                </td>
              </tr>
            ))}
            {inicial.length === 0 && <tr><td colSpan={4} className="py-4 text-zinc-500">Nenhum barbeiro.</td></tr>}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="mb-3 font-display text-xl">{editId ? "Editar barbeiro" : "Novo barbeiro"}</h3>
        <div className="space-y-2">
          <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => set("nome", e.target.value)} /></div>
          <div><Label>Especialidade</Label><Input value={form.especialidade} onChange={(e) => set("especialidade", e.target.value)} /></div>
          <div><Label>Telefone</Label><Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} /></div>
          <div><Label>Instagram</Label><Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
          <div><Label>Foto (URL)</Label><Input value={form.foto} onChange={(e) => set("foto", e.target.value)} /></div>
          <div><Label>Descrição</Label><Textarea rows={2} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)} /> Ativo
          </label>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={salvar} disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
            {editId && <Button variant="outline" onClick={novo}>Cancelar</Button>}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────── SERVIÇOS ───────────────
type Servico = { id: string; nome: string; descricao: string | null; preco: number; duracaoMinutos: number; imagem: string | null; ativo: boolean };
const servicoVazio = { nome: "", descricao: "", precoReais: "", duracaoMinutos: "30", imagem: "", ativo: true };

export function ServicosClient({ inicial }: { inicial: Servico[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{ nome: string; descricao: string; precoReais: string; duracaoMinutos: string; imagem: string; ativo: boolean }>({ ...servicoVazio });
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const novo = () => { setEditId(null); setForm({ ...servicoVazio }); setErro(""); };
  function editar(s: Servico) {
    setEditId(s.id);
    setForm({ nome: s.nome, descricao: s.descricao ?? "", precoReais: (s.preco / 100).toFixed(2), duracaoMinutos: String(s.duracaoMinutos), imagem: s.imagem ?? "", ativo: s.ativo });
  }
  function salvar() {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)));
    start(async () => {
      const r = await salvarServico(editId, fd);
      if (r?.erro) return setErro(r.erro);
      novo(); router.refresh();
    });
  }
  const excluir = (id: string) => start(async () => { await excluirServico(id); router.refresh(); });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-zinc-500">
            <tr><th className="pb-2">Serviço</th><th>Duração</th><th>Preço</th><th></th></tr>
          </thead>
          <tbody>
            {inicial.map((s) => (
              <tr key={s.id} className="border-t border-zinc-800">
                <td className="py-2 font-medium">{s.nome}</td>
                <td className="text-zinc-400">{s.duracaoMinutos} min</td>
                <td className="text-ouro">{formatBRL(s.preco)}</td>
                <td className="text-right">
                  <button className="text-ouro hover:underline" onClick={() => editar(s)}>editar</button>
                  <button className="ml-3 text-red-400 hover:underline" onClick={() => excluir(s.id)}>excluir</button>
                </td>
              </tr>
            ))}
            {inicial.length === 0 && <tr><td colSpan={4} className="py-4 text-zinc-500">Nenhum serviço.</td></tr>}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="mb-3 font-display text-xl">{editId ? "Editar serviço" : "Novo serviço"}</h3>
        <div className="space-y-2">
          <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => set("nome", e.target.value)} /></div>
          <div><Label>Descrição</Label><Textarea rows={2} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Preço (R$)</Label><Input type="number" step="0.01" value={form.precoReais} onChange={(e) => set("precoReais", e.target.value)} /></div>
            <div><Label>Duração (min)</Label><Input type="number" value={form.duracaoMinutos} onChange={(e) => set("duracaoMinutos", e.target.value)} /></div>
          </div>
          <div><Label>Imagem (URL)</Label><Input value={form.imagem} onChange={(e) => set("imagem", e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)} /> Ativo
          </label>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={salvar} disabled={pending}>{pending ? "Salvando…" : "Salvar"}</Button>
            {editId && <Button variant="outline" onClick={novo}>Cancelar</Button>}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────── DESPESA ───────────────
export function DespesaForm() {
  const router = useRouter();
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();
  function lancar() {
    const fd = new FormData();
    fd.set("valorReais", valor); fd.set("descricao", descricao);
    start(async () => {
      const r = await lancarDespesa(fd);
      if (r?.erro) return setErro(r.erro);
      setValor(""); setDescricao(""); setErro(""); router.refresh();
    });
  }
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div><Label>Despesa (R$)</Label><Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className="w-32" /></div>
      <div className="flex-1"><Label>Descrição</Label><Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: aluguel, produtos…" /></div>
      <Button variant="outline" onClick={lancar} disabled={pending}>Lançar saída</Button>
      {erro && <p className="w-full text-sm text-red-400">{erro}</p>}
    </div>
  );
}

// ─────────────── CONFIG ───────────────
type Cfg = Record<string, string | null>;
export function ConfigForm({ cfg }: { cfg: Cfg }) {
  const router = useRouter();
  const [f, setF] = useState({
    nomeBarbearia: cfg.nomeBarbearia ?? "Barbearia Jacob",
    whatsapp: cfg.whatsapp ?? "", instagram: cfg.instagram ?? "", endereco: cfg.endereco ?? "",
    horarioFuncionamento: cfg.horarioFuncionamento ?? "", chavePix: cfg.chavePix ?? "", logo: cfg.logo ?? "", tema: cfg.tema ?? "dark",
  });
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  function salvar() {
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.set(k, v));
    start(async () => {
      const r = await salvarConfig(fd);
      setMsg(r?.erro ?? "Configurações salvas."); router.refresh();
    });
  }
  return (
    <Card className="max-w-xl space-y-2">
      <div><Label>Nome da barbearia</Label><Input value={f.nomeBarbearia} onChange={(e) => set("nomeBarbearia", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>WhatsApp</Label><Input value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="5511999999999" /></div>
        <div><Label>Instagram</Label><Input value={f.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
      </div>
      <div><Label>Endereço</Label><Input value={f.endereco} onChange={(e) => set("endereco", e.target.value)} /></div>
      <div><Label>Horário de funcionamento</Label><Input value={f.horarioFuncionamento} onChange={(e) => set("horarioFuncionamento", e.target.value)} /></div>
      <div><Label>Chave PIX</Label><Input value={f.chavePix} onChange={(e) => set("chavePix", e.target.value)} /></div>
      <div><Label>Logo (URL)</Label><Input value={f.logo} onChange={(e) => set("logo", e.target.value)} /></div>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      <Button onClick={salvar} disabled={pending}>{pending ? "Salvando…" : "Salvar configurações"}</Button>
    </Card>
  );
}

// ─────────────── PERFIL ───────────────
export function PerfilForm({ email }: { email: string }) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  function trocar() {
    const fd = new FormData();
    fd.set("atual", atual); fd.set("nova", nova);
    start(async () => {
      const r = await trocarSenha(fd);
      setMsg(r?.erro ?? "Senha alterada com sucesso.");
      if (!r?.erro) { setAtual(""); setNova(""); }
    });
  }
  return (
    <Card className="max-w-md space-y-2">
      <p className="text-sm text-zinc-400">Conta: <span className="text-zinc-100">{email}</span></p>
      <div><Label>Senha atual</Label><Input type="password" value={atual} onChange={(e) => setAtual(e.target.value)} /></div>
      <div><Label>Nova senha</Label><Input type="password" value={nova} onChange={(e) => setNova(e.target.value)} /></div>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      <Button onClick={trocar} disabled={pending}>Alterar senha</Button>
    </Card>
  );
}
