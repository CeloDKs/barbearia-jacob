/**
 * Dinheiro é SEMPRE armazenado como Int em centavos.
 * Converta apenas nas bordas (input do usuário / exibição).
 */
export const toCentavos = (reais: number): number => Math.round(reais * 100);

export const toReais = (centavos: number): number => centavos / 100;

export const formatBRL = (centavos: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
