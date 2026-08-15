import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Request, Response } from "express";

export const ADMIN_COOKIE_NAME = "chafhein_admin_session";
const SESSION_TTL = "7d";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export type AdminSession = { sub: string; email: string };

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminSession(payload: AdminSession): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function getAdminSessionToken(req: Request): string | undefined {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  return cookies[ADMIN_COOKIE_NAME];
}

export function setAdminSessionCookie(res: Response, token: string) {
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearAdminSessionCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
