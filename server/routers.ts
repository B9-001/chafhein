import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminAuthProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createContact, getContacts,
  createDonation, getDonations,
  createVolunteer, getVolunteers,
  createCampaign, getCampaigns, updateCampaign, deleteCampaign,
  createEvent, getEvents, updateEvent, deleteEvent,
  getAdminByEmail,
} from "./supabase";
import { createCheckoutSession } from "./stripe";
import { verifyPassword } from "./_core/password";
import { signAdminSession, setAdminSessionCookie, clearAdminSessionCookie } from "./_core/adminSession";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Admin dashboard authentication. Self-hosted email/password login against
  // the `admins` table, independent of the (non-functional, outside the Manus
  // platform) OAuth flow used by `auth` above.
  adminAuth: router({
    me: publicProcedure.query(({ ctx }) => {
      return ctx.adminUser ? { email: ctx.adminUser.email } : null;
    }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(1, "Password is required"),
      }))
      .mutation(async ({ input, ctx }) => {
        const admin = await getAdminByEmail(input.email);
        if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const token = await signAdminSession({ sub: admin.id, email: admin.email });
        setAdminSessionCookie(ctx.res, token);

        return { success: true, email: admin.email };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSessionCookie(ctx.res);
      return { success: true } as const;
    }),
  }),

  forms: router({
    submitContact: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        message: z.string().min(1, "Message is required"),
      }))
      .mutation(async ({ input }) => {
        await createContact(input);
        return { success: true, message: "Contact message received" };
      }),

    submitDonation: publicProcedure
      .input(z.object({
        amount: z.string().min(1, "Amount is required"),
        donorName: z.string().min(1, "Name is required"),
        donorEmail: z.string().email("Invalid email"),
        message: z.string().optional(),
        paymentReference: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createDonation(input);
        return { success: true, message: "Donation recorded" };
      }),

    submitVolunteer: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        skills: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createVolunteer({
          name: input.name,
          email: input.email,
          skills: input.skills || '',
          message: input.message,
        });
        return { success: true, message: "Volunteer application received" };
      }),

    createStripeCheckout: publicProcedure
      .input(z.object({
        amount: z.number().min(1, "Amount must be greater than 0"),
        donorName: z.string().min(1, "Name is required"),
        donorEmail: z.string().email("Invalid email"),
      }))
      .mutation(async ({ input }) => {
        try {
          const session = await createCheckoutSession(input.amount, input.donorEmail, input.donorName);
          return { success: true, sessionId: session.id, url: session.url };
        } catch (error) {
          console.error("Stripe error:", error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create payment session' });
        }
      }),
  }),

  // Read-only, publicly available content the homepage renders live from the
  // database, kept in sync with what admins manage in the dashboard.
  content: router({
    getCampaigns: publicProcedure.query(async () => {
      return await getCampaigns();
    }),
    getEvents: publicProcedure.query(async () => {
      return await getEvents();
    }),
  }),

  admin: router({
    getContacts: adminAuthProcedure.query(async () => {
      return await getContacts();
    }),

    getDonations: adminAuthProcedure.query(async () => {
      return await getDonations();
    }),

    getVolunteers: adminAuthProcedure.query(async () => {
      return await getVolunteers();
    }),

    getCampaigns: adminAuthProcedure.query(async () => {
      return await getCampaigns();
    }),

    createCampaign: adminAuthProcedure
      .input(z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        targetAmount: z.string().optional(),
        status: z.enum(["active", "completed", "paused"]).default("active"),
      }))
      .mutation(async ({ input }) => {
        await createCampaign({
          title: input.title,
          description: input.description || '',
          image: input.imageUrl,
          targetAmount: input.targetAmount ? parseFloat(input.targetAmount) : undefined,
          status: input.status,
        });
        return { success: true, message: "Campaign created" };
      }),

    updateCampaign: adminAuthProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        targetAmount: z.string().optional(),
        currentAmount: z.string().optional(),
        status: z.enum(["active", "completed", "paused"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, imageUrl, targetAmount, currentAmount, ...data } = input;
        await updateCampaign(id, {
          ...data,
          image: imageUrl,
          targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
          currentAmount: currentAmount ? parseFloat(currentAmount) : undefined,
        });
        return { success: true, message: "Campaign updated" };
      }),

    deleteCampaign: adminAuthProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await deleteCampaign(input.id);
        return { success: true, message: "Campaign deleted" };
      }),

    getEvents: adminAuthProcedure.query(async () => {
      return await getEvents();
    }),

    createEvent: adminAuthProcedure
      .input(z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        date: z.string().min(1, "Date is required"),
        location: z.string().optional(),
        status: z.enum(["upcoming", "ongoing", "completed"]).default("upcoming"),
      }))
      .mutation(async ({ input }) => {
        await createEvent({
          title: input.title,
          description: input.description || '',
          image: input.imageUrl,
          eventDate: input.date,
          location: input.location,
          status: input.status,
        });
        return { success: true, message: "Event created" };
      }),

    updateEvent: adminAuthProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        date: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(["upcoming", "ongoing", "completed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, imageUrl, date, ...data } = input;
        await updateEvent(id, {
          ...data,
          image: imageUrl,
          eventDate: date,
        });
        return { success: true, message: "Event updated" };
      }),

    deleteEvent: adminAuthProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await deleteEvent(input.id);
        return { success: true, message: "Event deleted" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
