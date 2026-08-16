import { publicProcedure, router, adminAuthProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createContact, getContacts,
  createDonation, getDonations,
  createVolunteer, getVolunteers,
  createCampaign, getCampaigns, updateCampaign, deleteCampaign,
  createEvent, getEvents, updateEvent, deleteEvent,
  createEventRegistration, getEventRegistrations,
  getAdminByEmail, uploadMedia,
} from "./supabase";
import { verifyPassword } from "./_core/password";
import { signAdminSession, setAdminSessionCookie, clearAdminSessionCookie } from "./_core/adminSession";
import { sendDonationNotification, sendEventRegistrationNotification } from "./_core/email";

export const appRouter = router({
  // Admin dashboard authentication: self-hosted email/password login against
  // the `admins` table.
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
        setAdminSessionCookie(ctx.resHeaders, token);

        return { success: true, email: admin.email };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSessionCookie(ctx.resHeaders);
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
        // Awaited (not fire-and-forget) because Vercel serverless functions
        // can freeze/terminate as soon as the response is sent — a detached
        // async call here risks the email never actually going out.
        // sendDonationNotification swallows its own errors, so a failed
        // notification never blocks the donation from being recorded.
        await sendDonationNotification(input);
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

    submitEventRegistration: publicProcedure
      .input(z.object({
        eventId: z.string().min(1, "Event is required"),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        let registration;
        try {
          registration = await createEventRegistration(input);
        } catch (error: any) {
          // Postgres FK violation — the event doesn't exist (or was deleted).
          if (error?.code === "23503") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "This event no longer exists" });
          }
          throw error;
        }

        await sendEventRegistrationNotification({
          eventTitle: registration.eventTitle,
          name: input.name,
          email: input.email,
          phone: input.phone,
        });

        return { success: true, message: "Registration received" };
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
    uploadImage: adminAuthProcedure
      .input(z.object({
        fileName: z.string().min(1),
        contentType: z.string().regex(/^image\//, "Only image uploads are allowed"),
        dataBase64: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        // Vercel serverless functions hard-cap the request body at 4.5MB,
        // regardless of the Express body-parser limit set below. Base64
        // encoding inflates the raw file size by ~4/3, so a 3MB source
        // image becomes ~4MB of base64 — keep the ceiling comfortably
        // under the platform limit so uploads fail fast client-side
        // instead of being rejected by the platform with an opaque 413.
        const approxBytes = (input.dataBase64.length * 3) / 4;
        if (approxBytes > 3 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Image must be 3MB or smaller" });
        }
        const url = await uploadMedia(input.fileName, input.contentType, input.dataBase64);
        return { url };
      }),

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

    getEventRegistrations: adminAuthProcedure.query(async () => {
      return await getEventRegistrations();
    }),
  }),
});

export type AppRouter = typeof appRouter;
