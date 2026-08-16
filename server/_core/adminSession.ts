import { parse as parseCookieHeader, serialize as serializeCookie } from "cookie";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "chafhein_admin_session";
const SESSION_TTL = "7d";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

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

// Next.js Route Handlers (via the tRPC fetch adapter) work with the standard
// Fetch `Request`/`Headers` types rather than Express's `req`/`res`, so
// cookie reads/writes go through the `cookie` package directly instead of
// Express's `req.headers.cookie` / `res.cookie()` helpers.

export function getAdminSessionToken(req: Request): string | undefined {
  const cookies = parseCookieHeader(req.headers.get("cookie") ?? "");
  return cookies[ADMIN_COOKIE_NAME];
}

export function setAdminSessionCookie(resHeaders: Headers, token: string) {
  resHeaders.append(
    "Set-Cookie",
    serializeCookie(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_SECONDS,
    })
  );
}

export function clearAdminSessionCookie(resHeaders: Headers) {
  resHeaders.append(
    "Set-Cookie",
    serializeCookie(ADMIN_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    })
  );
}
