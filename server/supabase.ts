import { createClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not configured. Using local database fallback.');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper functions for database operations
export async function createContact(data: {
  name: string;
  email: string;
  message: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: result, error } = await supabase
    .from('contacts')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function createDonation(data: {
  donorName: string;
  donorEmail: string;
  amount: string;
  message?: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: result, error } = await supabase
    .from('donations')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function createVolunteer(data: {
  name: string;
  email: string;
  skills: string;
  message?: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: result, error } = await supabase
    .from('volunteers')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function getContacts() {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDonations() {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getVolunteers() {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCampaigns() {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCampaign(data: {
  title: string;
  description: string;
  image?: string;
  targetAmount?: number;
  currentAmount?: number;
  status?: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: result, error } = await supabase
    .from('campaigns')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function updateCampaign(id: number, data: Partial<{
  title: string;
  description: string;
  image?: string;
  targetAmount?: number;
  currentAmount?: number;
  status?: string;
}>) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: result, error } = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', id)
    .select();

  if (error) throw error;
  return result;
}

export async function deleteCampaign(id: number) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function getEvents() {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createEvent(data: {
  title: string;
  description: string;
  image?: string;
  eventDate?: string;
  location?: string;
  status?: string;
}) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: result, error } = await supabase
    .from('events')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function updateEvent(id: number, data: Partial<{
  title: string;
  description: string;
  image?: string;
  eventDate?: string;
  location?: string;
  status?: string;
}>) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data: result, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .select();

  if (error) throw error;
  return result;
}

export async function deleteEvent(id: number) {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
