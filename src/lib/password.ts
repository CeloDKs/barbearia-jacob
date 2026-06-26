import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashSenha = (senha: string): Promise<string> =>
  bcrypt.hash(senha, SALT_ROUNDS);

export const verificarSenha = (senha: string, hash: string): Promise<boolean> =>
  bcrypt.compare(senha, hash);
