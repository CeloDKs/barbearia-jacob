import { cookies } from "next/headers";
import { criarToken, verificarToken, type SessionPayload } from "./jwt";

export const SESSION_COOKIE = "bj_session";
const MAX_AGE = 60 * 60 * 8; // 8h

export async function abrirSessao(payload: SessionPayload): Promise<void> {
  const token = await criarToken(payload, MAX_AGE);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function fecharSessao(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function sessaoAtual(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verificarToken(token);
}
