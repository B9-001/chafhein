import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not configured. Server-side data access will fail.');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

function requireSupabase() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

// The Postgres schema uses snake_case columns; the app (and its tRPC contracts)
// use camelCase. These row types + mappers keep that translation in one place
// instead of scattered across callers, since PostgREST rejects unknown column
// names outright rather than ignoring them.

type ContactRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const mapContact = (row: ContactRow): Contact => ({
  id: row.id,
  name: row.name,
  email: row.email,
  message: row.message,
  createdAt: row.created_at,
});

type DonationRow = {
  id: string;
  amount: string;
  donor_name: string;
  donor_email: string;
  message: string | null;
  payment_reference: string | null;
  status: string;
  created_at: string;
};

export type Donation = {
  id: string;
  amount: string;
  donorName: string;
  donorEmail: string;
  message: string | null;
  paymentReference: string | null;
  status: string;
  createdAt: string;
};

const mapDonation = (row: DonationRow): Donation => ({
  id: row.id,
  amount: row.amount,
  donorName: row.donor_name,
  donorEmail: row.donor_email,
  message: row.message,
  paymentReference: row.payment_reference,
  status: row.status,
  createdAt: row.created_at,
});

type VolunteerRow = {
  id: string;
  name: string;
  email: string;
  skills: string | null;
  message: string | null;
  created_at: string;
};

export type Volunteer = {
  id: string;
  name: string;
  email: string;
  skills: string | null;
  message: string | null;
  createdAt: string;
};

const mapVolunteer = (row: VolunteerRow): Volunteer => ({
  id: row.id,
  name: row.name,
  email: row.email,
  skills: row.skills,
  message: row.message,
  createdAt: row.created_at,
});

type CampaignRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_amount: string | number | null;
  raised_amount: string | number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Campaign = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  targetAmount: string | number | null;
  raisedAmount: string | number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const mapCampaign = (row: CampaignRow): Campaign => ({
  id: row.id,
  title: row.title,
  description: row.description,
  imageUrl: row.image_url,
  targetAmount: row.target_amount,
  raisedAmount: row.raised_amount,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string | null;
  location: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  webinar_link: string | null;
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  eventDate: string | null;
  location: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  webinarLink: string | null;
};

const mapEvent = (row: EventRow): EventItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  imageUrl: row.image_url,
  eventDate: row.event_date,
  location: row.location,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  webinarLink: row.webinar_link,
});

type EventRegistrationRow = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  events: { title: string; webinar_link: string | null; event_date: string | null; location: string | null } | null;
};

export type EventRegistration = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventWebinarLink: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
};

const mapEventRegistration = (row: EventRegistrationRow): EventRegistration => ({
  id: row.id,
  eventId: row.event_id,
  eventTitle: row.events?.title ?? "Unknown event",
  eventWebinarLink: row.events?.webinar_link ?? null,
  eventDate: row.events?.event_date ?? null,
  eventLocation: row.events?.location ?? null,
  name: row.name,
  email: row.email,
  phone: row.phone,
  createdAt: row.created_at,
});

export type Admin = { id: string; email: string; passwordHash: string };

// --- Contacts ---

export async function createContact(data: { name: string; email: string; message: string }): Promise<Contact> {
  const { data: result, error } = await requireSupabase()
    .from('contacts')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return mapContact(result);
}

export async function getContacts(): Promise<Contact[]> {
  const { data, error } = await requireSupabase()
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapContact);
}

// --- Donations ---

export async function createDonation(data: {
  donorName: string;
  donorEmail: string;
  amount: string;
  message?: string;
  paymentReference?: string;
}): Promise<Donation> {
  const { data: result, error } = await requireSupabase()
    .from('donations')
    .insert([{
      donor_name: data.donorName,
      donor_email: data.donorEmail,
      amount: data.amount,
      message: data.message || null,
      payment_reference: data.paymentReference || null,
      status: 'completed',
    }])
    .select()
    .single();

  if (error) throw error;
  return mapDonation(result);
}

export async function getDonations(): Promise<Donation[]> {
  const { data, error } = await requireSupabase()
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDonation);
}

// --- Volunteers ---

export async function createVolunteer(data: {
  name: string;
  email: string;
  skills: string;
  message?: string;
}): Promise<Volunteer> {
  const { data: result, error } = await requireSupabase()
    .from('volunteers')
    .insert([{
      name: data.name,
      email: data.email,
      skills: data.skills || null,
      message: data.message || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return mapVolunteer(result);
}

export async function getVolunteers(): Promise<Volunteer[]> {
  const { data, error } = await requireSupabase()
    .from('volunteers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapVolunteer);
}

// --- Campaigns ---

export async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await requireSupabase()
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCampaign);
}

export async function createCampaign(data: {
  title: string;
  description?: string;
  image?: string;
  targetAmount?: number;
  status?: string;
}): Promise<Campaign> {
  const { data: result, error } = await requireSupabase()
    .from('campaigns')
    .insert([{
      title: data.title,
      description: data.description || null,
      image_url: data.image || null,
      target_amount: data.targetAmount ?? 0,
      status: data.status || 'active',
    }])
    .select()
    .single();

  if (error) throw error;
  return mapCampaign(result);
}

export async function updateCampaign(id: string, data: Partial<{
  title: string;
  description: string;
  image: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
}>): Promise<Campaign> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined) patch.description = data.description;
  if (data.image !== undefined) patch.image_url = data.image;
  if (data.targetAmount !== undefined) patch.target_amount = data.targetAmount;
  if (data.currentAmount !== undefined) patch.raised_amount = data.currentAmount;
  if (data.status !== undefined) patch.status = data.status;
  patch.updated_at = new Date().toISOString();

  const { data: result, error } = await requireSupabase()
    .from('campaigns')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapCampaign(result);
}

export async function deleteCampaign(id: string): Promise<true> {
  const { error } = await requireSupabase().from('campaigns').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- Events ---

export async function getEvents(): Promise<EventItem[]> {
  const { data, error } = await requireSupabase()
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

export async function createEvent(data: {
  title: string;
  description?: string;
  image?: string;
  eventDate?: string;
  location?: string;
  status?: string;
  webinarLink?: string;
}): Promise<EventItem> {
  const { data: result, error } = await requireSupabase()
    .from('events')
    .insert([{
      title: data.title,
      description: data.description || null,
      image_url: data.image || null,
      event_date: data.eventDate || null,
      location: data.location || null,
      status: data.status || 'upcoming',
      webinar_link: data.webinarLink || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return mapEvent(result);
}

export async function updateEvent(id: string, data: Partial<{
  title: string;
  description: string;
  image: string;
  eventDate: string;
  location: string;
  status: string;
  webinarLink: string;
}>): Promise<EventItem> {
  const patch: Record<string, unknown> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined) patch.description = data.description;
  if (data.image !== undefined) patch.image_url = data.image;
  if (data.eventDate !== undefined) patch.event_date = data.eventDate;
  if (data.location !== undefined) patch.location = data.location;
  if (data.status !== undefined) patch.status = data.status;
  if (data.webinarLink !== undefined) patch.webinar_link = data.webinarLink || null;
  patch.updated_at = new Date().toISOString();

  const { data: result, error } = await requireSupabase()
    .from('events')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapEvent(result);
}

export async function deleteEvent(id: string): Promise<true> {
  const { error } = await requireSupabase().from('events').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- Event registrations ---

export async function createEventRegistration(data: {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
}): Promise<EventRegistration> {
  const { data: result, error } = await requireSupabase()
    .from('event_registrations')
    .insert([{
      event_id: data.eventId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
    }])
    .select('*, events(title, webinar_link, event_date, location)')
    .single();

  if (error) throw error;
  return mapEventRegistration(result);
}

export async function getEventRegistrations(): Promise<EventRegistration[]> {
  const { data, error } = await requireSupabase()
    .from('event_registrations')
    .select('*, events(title, webinar_link, event_date, location)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapEventRegistration);
}

// --- Media uploads ---

const MEDIA_BUCKET = 'media';

export async function uploadMedia(fileName: string, contentType: string, dataBase64: string): Promise<string> {
  const buffer = Buffer.from(dataBase64, 'base64');
  const ext = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
  const key = `${crypto.randomUUID()}.${ext}`;

  const { error } = await requireSupabase().storage
    .from(MEDIA_BUCKET)
    .upload(key, buffer, { contentType, upsert: false });

  if (error) throw error;

  const { data } = requireSupabase().storage.from(MEDIA_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

// --- Admin accounts ---

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const { data, error } = await requireSupabase()
    .from('admins')
    .select('id, email, password_hash')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { id: data.id, email: data.email, passwordHash: data.password_hash };
}
