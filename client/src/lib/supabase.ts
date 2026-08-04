import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export async function insertContact(data: {
  name: string;
  email: string;
  message: string;
}) {
  const { data: result, error } = await supabase
    .from('contacts')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function insertDonation(data: {
  donorName: string;
  donorEmail: string;
  amount: string;
  message?: string;
}) {
  const { data: result, error } = await supabase
    .from('donations')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function insertVolunteer(data: {
  name: string;
  email: string;
  skills: string;
  message?: string;
}) {
  const { data: result, error } = await supabase
    .from('volunteers')
    .insert([data])
    .select();

  if (error) throw error;
  return result;
}

export async function getContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDonations() {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getVolunteers() {
  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCampaigns() {
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
  const { data: result, error } = await supabase
    .from('campaigns')
    .update(data)
    .eq('id', id)
    .select();

  if (error) throw error;
  return result;
}

export async function deleteCampaign(id: number) {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function getEvents() {
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
  const { data: result, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .select();

  if (error) throw error;
  return result;
}

export async function deleteEvent(id: number) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
