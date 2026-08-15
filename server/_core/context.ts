import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getAdminSessionToken, verifyAdminSession, type AdminSession } from "./adminSession";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  adminUser: AdminSession | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  let adminUser: AdminSession | null = null;
  try {
    const token = getAdminSessionToken(opts.req);
    adminUser = token ? await verifyAdminSession(token) : null;
  } catch {
    adminUser = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    adminUser,
  };
}
