/**
 * scoped() aplica a convenção de soft-delete em TODA query de leitura.
 * Single-tenant: injeta apenas { deletedAt: null }.
 *
 * Para multi-tenant (estilo M7 Burger/M7Hub), este é o ÚNICO ponto
 * a mudar: receba o ctx e injete companyId aqui — todas as queries
 * que usam scoped() passam a ser isoladas por empresa automaticamente.
 *
 *   export function scoped<T>(ctx: Ctx, where?: T) {
 *     return { ...where, companyId: ctx.companyId, deletedAt: null };
 *   }
 */
export function scoped<T extends Record<string, unknown>>(
  where?: T,
): T & { deletedAt: null } {
  return { ...(where ?? ({} as T)), deletedAt: null };
}
