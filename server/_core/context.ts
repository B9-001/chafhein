import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getAdminSessionToken, verifyAdminSession, type AdminSession } from "./adminSession";

export type TrpcContext = {
  adminUser: AdminSession | null;
  resHeaders: Headers;
};

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  let adminUser: AdminSession | null = null;

  try {
    const token = getAdminSessionToken(opts.req);
    adminUser = token ? await verifyAdminSession(token) : null;
  } catch {
    adminUser = null;
  }

  return {
    adminUser,
    resHeaders: opts.resHeaders,
  };
}
