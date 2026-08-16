import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Who gets notified when a donation comes in.
const NOTIFY_EMAIL = process.env.DONATION_NOTIFY_EMAIL || "info@chafhein.ng";

// Resend's shared "onboarding@resend.dev" sender works without verifying a
// domain, but can only deliver to the email address the Resend account was
// signed up with. Once a domain is verified in the Resend dashboard, set
// RESEND_FROM_EMAIL to a real address on that domain (e.g.
// "CHAFHEIN Donations <donations@chafhein.ng>") to notify any recipient.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "CHAFHEIN Donations <onboarding@resend.dev>";

export type DonationNotification = {
  amount: string;
  donorName: string;
  donorEmail: string;
  message?: string;
};

function formatNaira(value: string): string {
  const num = Number(value);
  return Number.isNaN(num) ? value : `₦${num.toLocaleString()}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Best-effort: a failed notification email should never break the donation
// flow itself (the donation is already recorded in Supabase by the time this
// runs), so every failure is caught and logged rather than thrown.
export async function sendDonationNotification(donation: DonationNotification): Promise<void> {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY is not configured — skipping donation notification email");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `New donation received — ${formatNaira(donation.amount)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2 style="color: #91008D;">New Donation Received</h2>
          <p><strong>Amount:</strong> ${formatNaira(donation.amount)}</p>
          <p><strong>Donor:</strong> ${escapeHtml(donation.donorName)} (${escapeHtml(donation.donorEmail)})</p>
          ${donation.message ? `<p><strong>Message:</strong> ${escapeHtml(donation.message)}</p>` : ""}
          <p style="color: #888; font-size: 12px; margin-top: 24px;">
            Sent automatically by the CHAFHEIN website when a donation is submitted.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Email] Resend rejected the donation notification:", error);
    }
  } catch (error) {
    console.error("[Email] Failed to send donation notification:", error);
  }
}
