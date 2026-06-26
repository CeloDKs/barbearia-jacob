import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
const ISSUER = "barbearia-jacob";

export type SessionPayload = { sub: string; nome: string; email: string };

export async function criarToken(
  payload: SessionPayload,
  maxAgeSeconds = 60 * 60 * 8, // 8h
): Promise<string> {
  return new SignJWT({ nome: payload.nome, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(SECRET);
}

export async function verificarToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { issuer: ISSUER });
    return {
      sub: payload.sub as string,
      nome: payload.nome as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
