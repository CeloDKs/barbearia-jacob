import { prisma } from "./db";
import type { AcaoAuditoria } from "@prisma/client";

type RegistrarParams = {
  usuarioId?: string | null;
  acao: AcaoAuditoria;
  modulo: string;
  descricao?: string;
  ip?: string | null;
};

/**
 * Registra uma ação administrativa. Chame em login/logout e em todo
 * create/update/delete/alteração de status/configuração.
 */
export async function registrarAuditoria(p: RegistrarParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      usuarioId: p.usuarioId ?? null,
      acao: p.acao,
      modulo: p.modulo,
      descricao: p.descricao,
      ip: p.ip ?? null,
    },
  });
}
