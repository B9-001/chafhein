import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock context for testing
function createMockContext(user?: Partial<User>, isAdmin = false): TrpcContext {
  return {
    user: user
      ? ({
          id: 1,
          openId: "test-user",
          name: "Test User",
          email: "test@example.com",
          loginMethod: "manus",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
          ...user,
        } as User)
      : null,
    adminUser: isAdmin ? { sub: "test-admin", email: "admin@example.com" } : null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("Form Submission Procedures", () => {
  it("should submit contact form with valid data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.forms.submitContact({
      name: "John Doe",
      email: "john@example.com",
      message: "Test message",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  });

  it("should submit donation with valid data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.forms.submitDonation({
      donorName: "Jane Smith",
      donorEmail: "jane@example.com",
      amount: "5000",
      message: "Supporting your mission",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  });

  it("should submit volunteer application with valid data", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.forms.submitVolunteer({
      name: "Bob Wilson",
      email: "bob@example.com",
      skills: "Healthcare, Education",
      message: "I want to volunteer",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  });
});

describe("Admin Dashboard Access Control", () => {
  it("should allow admin session to access contacts", async () => {
    const ctx = createMockContext(undefined, true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getContacts();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin session to access donations", async () => {
    const ctx = createMockContext(undefined, true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getDonations();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow admin session to access volunteers", async () => {
    const ctx = createMockContext(undefined, true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getVolunteers();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny non-admin access to contacts", async () => {
    const ctx = createMockContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getContacts();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should deny non-admin access to donations", async () => {
    const ctx = createMockContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getDonations();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should deny non-admin access to volunteers", async () => {
    const ctx = createMockContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getVolunteers();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should deny unauthenticated access to admin procedures", async () => {
    const ctx = createMockContext(undefined);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getContacts();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});
