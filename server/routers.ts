import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createContact, getContacts, createDonation, getDonations, createVolunteer, getVolunteers } from "./db";

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
        await createVolunteer(input);
        return { success: true, message: "Volunteer application received" };
      }),
  }),

  admin: router({
    getContacts: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .query(async () => {
        return await getContacts();
      }),

    getDonations: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .query(async () => {
        return await getDonations();
      }),

    getVolunteers: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return next({ ctx });
      })
      .query(async () => {
        return await getVolunteers();
      }),
  }),
});

export type AppRouter = typeof appRouter;
