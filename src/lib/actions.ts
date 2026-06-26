"use server";

import { prisma } from "./db";
import { hashSenha, verificarSenha } from "./password";
import { abrirSessao, fecharSessao, sessaoAtual } from "./session";
import { registrarAuditoria } from "./audit";
import { gerarSlots } from "./slots";
import {
  agendamentoSchema,
  loginSchema,
  barbeiroSchema,
  servicoSchema,
  configSchema,
} from "./validators";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

async function exigirAdmin() {
  const s = await sessaoAtual();
  if (!s) redirect("/admin/login");
  return s;
}

// ─────────────── PÚBLICO: disponibilidade ───────────────
export async function getDisponibilidade(barbeiroId: string, dataISO: string) {
  if (!barbeiroId || !dataISO) return [] as { horario: string; livre: boolean }[];
  const data = new Date(dataISO + "T00:00:00");
  const ocupados = await prisma.agendamento.findMany({
    where: { barbeiroId, data, deletedAt: null, status: { not: "cancelado" } },
    select: { horario: true },
  });
  const set = new Set(ocupados.map((o) => o.horario));
  return gerarSlots().map((h) => ({ horario: h, livre: !set.has(h) }));
}

// ─────────────── PÚBLICO: criar agendamento ───────────────
export async function criarAgendamento(input: unknown) {
  const parsed = agendamentoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const telefone = d.cliente.telefone.replace(/\D/g, "");

  const [servicos, combos] = await Promise.all([
    d.servicoIds.length
      ? prisma.servico.findMany({ where: { id: { in: d.servicoIds }, deletedAt: null } })
      : Promise.resolve([]),
    d.comboIds.length
      ? prisma.combo.findMany({ where: { id: { in: d.comboIds }, deletedAt: null } })
      : Promise.resolve([]),
  ]);

  const valorTotal =
    servicos.reduce((s, x) => s + x.preco, 0) + combos.reduce((s, x) => s + x.preco, 0);
  const data = new Date(d.data + "T00:00:00");

  try {
    const ag = await prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.upsert({
        where: { telefone },
        update: { nomeCompleto: d.cliente.nomeCompleto, email: d.cliente.email || null },
        create: {
          nomeCompleto: d.cliente.nomeCompleto,
          telefone,
          email: d.cliente.email || null,
          observacoes: d.cliente.observacoes || null,
        },
      });

      return tx.agendamento.create({
        data: {
          clienteId: cliente.id,
          barbeiroId: d.barbeiroId,
          data,
          horario: d.horario,
          status: "pendente",
          formaPagamento: d.formaPagamento,
          observacoes: d.cliente.observacoes || null,
          valorTotal,
          servicos: {
            create: servicos.map((s) => ({ servicoId: s.id, servicoNome: s.nome, preco: s.preco })),
          },
          combos: {
            create: combos.map((c) => ({ comboId: c.id, comboNome: c.nome, preco: c.preco })),
          },
        },
      });
    });

    revalidatePath("/admin/agendamentos");
    return { ok: true as const, agendamentoId: ag.id, valorTotal };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false as const, erro: "Esse horário acabou de ser reservado. Escolha outro." };
    }
    return { ok: false as const, erro: "Não foi possível concluir o agendamento." };
  }
}

// ─────────────── AUTH ───────────────
export async function login(_prev: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) return { erro: "Informe e-mail e senha válidos." };

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin || !admin.ativo || admin.deletedAt) return { erro: "Credenciais inválidas." };

  const ok = await verificarSenha(parsed.data.senha, admin.senhaHash);
  if (!ok) return { erro: "Credenciais inválidas." };

  await abrirSessao({ sub: admin.id, nome: admin.nome, email: admin.email });
  await registrarAuditoria({ usuarioId: admin.id, acao: "login", modulo: "auth", descricao: "Login no painel" });
  redirect("/admin");
}

export async function logout() {
  const s = await sessaoAtual();
  if (s) await registrarAuditoria({ usuarioId: s.sub, acao: "logout", modulo: "auth" });
  await fecharSessao();
  redirect("/admin/login");
}

// ─────────────── AGENDAMENTOS (status) ───────────────
type StatusAg = "pendente" | "confirmado" | "concluido" | "cancelado";

export async function atualizarStatusAgendamento(id: string, status: StatusAg) {
  const s = await exigirAdmin();
  await prisma.agendamento.update({ where: { id }, data: { status } });

  if (status === "concluido") {
    const ag = await prisma.agendamento.findUnique({ where: { id } });
    const jaLancado = await prisma.registroFinanceiro.findFirst({
      where: { agendamentoId: id, tipo: "entrada" },
    });
    if (ag && !jaLancado && ag.valorTotal > 0) {
      await prisma.registroFinanceiro.create({
        data: { agendamentoId: id, valor: ag.valorTotal, tipo: "entrada", descricao: "Serviço concluído" },
      });
    }
  }
  await registrarAuditoria({
    usuarioId: s.sub, acao: "alteracao_status", modulo: "agendamentos", descricao: `Status -> ${status}`,
  });
  revalidatePath("/admin/agendamentos");
  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");
}

// ─────────────── BARBEIROS ───────────────
export async function salvarBarbeiro(id: string | null, formData: FormData) {
  const s = await exigirAdmin();
  const parsed = barbeiroSchema.safeParse({
    nome: formData.get("nome"),
    especialidade: formData.get("especialidade") || undefined,
    descricao: formData.get("descricao") || undefined,
    telefone: formData.get("telefone") || undefined,
    instagram: formData.get("instagram") || undefined,
    foto: formData.get("foto") || undefined,
    ativo: formData.get("ativo") === "true" || formData.get("ativo") === "on",
  });
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  if (id) {
    await prisma.barbeiro.update({ where: { id }, data: parsed.data });
    await registrarAuditoria({ usuarioId: s.sub, acao: "edicao", modulo: "barbeiros", descricao: parsed.data.nome });
  } else {
    await prisma.barbeiro.create({ data: parsed.data });
    await registrarAuditoria({ usuarioId: s.sub, acao: "criacao", modulo: "barbeiros", descricao: parsed.data.nome });
  }
  revalidatePath("/admin/barbeiros");
  revalidatePath("/equipe");
  return { ok: true as const };
}

export async function excluirBarbeiro(id: string) {
  const s = await exigirAdmin();
  await prisma.barbeiro.update({ where: { id }, data: { deletedAt: new Date(), ativo: false } });
  await registrarAuditoria({ usuarioId: s.sub, acao: "exclusao", modulo: "barbeiros", descricao: id });
  revalidatePath("/admin/barbeiros");
  revalidatePath("/equipe");
}

// ─────────────── SERVIÇOS ───────────────
export async function salvarServico(id: string | null, formData: FormData) {
  const s = await exigirAdmin();
  const parsed = servicoSchema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao") || undefined,
    precoReais: formData.get("precoReais"),
    duracaoMinutos: formData.get("duracaoMinutos"),
    imagem: formData.get("imagem") || undefined,
    ativo: formData.get("ativo") === "true" || formData.get("ativo") === "on",
  });
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const data = {
    nome: parsed.data.nome,
    descricao: parsed.data.descricao,
    preco: Math.round(parsed.data.precoReais * 100),
    duracaoMinutos: parsed.data.duracaoMinutos,
    imagem: parsed.data.imagem,
    ativo: parsed.data.ativo,
  };

  if (id) {
    await prisma.servico.update({ where: { id }, data });
    await registrarAuditoria({ usuarioId: s.sub, acao: "edicao", modulo: "servicos", descricao: data.nome });
  } else {
    await prisma.servico.create({ data });
    await registrarAuditoria({ usuarioId: s.sub, acao: "criacao", modulo: "servicos", descricao: data.nome });
  }
  revalidatePath("/admin/servicos");
  revalidatePath("/servicos");
  return { ok: true as const };
}

export async function excluirServico(id: string) {
  const s = await exigirAdmin();
  await prisma.servico.update({ where: { id }, data: { deletedAt: new Date(), ativo: false } });
  await registrarAuditoria({ usuarioId: s.sub, acao: "exclusao", modulo: "servicos", descricao: id });
  revalidatePath("/admin/servicos");
  revalidatePath("/servicos");
}

// ─────────────── FINANCEIRO: despesa ───────────────
export async function lancarDespesa(formData: FormData) {
  const s = await exigirAdmin();
  const valorReais = Number(formData.get("valorReais"));
  const descricao = String(formData.get("descricao") || "");
  if (!valorReais || valorReais <= 0) return { erro: "Valor inválido." };
  await prisma.registroFinanceiro.create({
    data: { valor: Math.round(valorReais * 100), tipo: "saida", descricao },
  });
  await registrarAuditoria({ usuarioId: s.sub, acao: "criacao", modulo: "financeiro", descricao: `Saída: ${descricao}` });
  revalidatePath("/admin/financeiro");
  return { ok: true as const };
}

// ─────────────── CONFIGURAÇÕES ───────────────
export async function salvarConfig(formData: FormData) {
  const s = await exigirAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = configSchema.safeParse(raw);
  if (!parsed.success) return { erro: "Dados inválidos." };
  const existente = await prisma.configuracao.findFirst();
  if (existente) {
    await prisma.configuracao.update({ where: { id: existente.id }, data: parsed.data });
  } else {
    await prisma.configuracao.create({ data: parsed.data });
  }
  await registrarAuditoria({ usuarioId: s.sub, acao: "configuracao", modulo: "configuracoes", descricao: "Atualização" });
  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

// ─────────────── PERFIL: trocar senha ───────────────
export async function trocarSenha(formData: FormData) {
  const s = await exigirAdmin();
  const atual = String(formData.get("atual") || "");
  const nova = String(formData.get("nova") || "");
  if (nova.length < 6) return { erro: "Nova senha muito curta (mín. 6)." };
  const admin = await prisma.admin.findUnique({ where: { id: s.sub } });
  if (!admin) return { erro: "Sessão inválida." };
  const ok = await verificarSenha(atual, admin.senhaHash);
  if (!ok) return { erro: "Senha atual incorreta." };
  await prisma.admin.update({ where: { id: admin.id }, data: { senhaHash: await hashSenha(nova) } });
  await registrarAuditoria({ usuarioId: admin.id, acao: "configuracao", modulo: "perfil", descricao: "Troca de senha" });
  return { ok: true as const };
}
