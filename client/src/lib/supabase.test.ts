import { describe, it, expect, beforeAll } from 'vitest';
import { supabase, getContacts, getDonations, getVolunteers } from './supabase';

describe('Supabase Integration', () => {
  beforeAll(async () => {
    // Test that Supabase client is initialized
    expect(supabase).toBeDefined();
  });

  it('should connect to Supabase', async () => {
    // Test basic connectivity by querying contacts table
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('count', { count: 'exact' });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    } catch (error) {
      console.error('Supabase connection error:', error);
      throw error;
    }
  });

  it('should fetch contacts from Supabase', async () => {
    try {
      const contacts = await getContacts();
      expect(Array.isArray(contacts)).toBe(true);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  });

  it('should fetch donations from Supabase', async () => {
    try {
      const donations = await getDonations();
      expect(Array.isArray(donations)).toBe(true);
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  });

  it('should fetch volunteers from Supabase', async () => {
    try {
      const volunteers = await getVolunteers();
      expect(Array.isArray(volunteers)).toBe(true);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      throw error;
    }
  });
});
