import { supabase } from './supabaseClient';

/**
 * Fetch all doctor profiles from the profiles table.
 * Doctors are real auth users with role = "doctor".
 * @returns {{ data: Array, error: object|null }}
 */
export async function getDoctors() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'doctor')
    .order('name', { ascending: true });

  return { data: data || [], error };
}

/**
 * Fetch only available doctor profiles.
 * Since availability isn't a profile field yet, returns all doctors.
 * @returns {{ data: Array, error: object|null }}
 */
export async function getAvailableDoctors() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'doctor')
    .order('name', { ascending: true });

  return { data: data || [], error };
}

/**
 * Fetch a single doctor profile by their user ID.
 * @param {string} doctorId - The doctor's auth user UUID
 * @returns {{ data: object|null, error: object|null }}
 */
export async function getDoctorById(doctorId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', doctorId)
    .single();

  return { data, error };
}

/**
 * Helper: generate avatar initials from a name like "Dr. Sarah Johnson" → "SJ"
 */
export function getDoctorAvatar(name) {
  const parts = (name || '').replace(/^Dr\.?\s*/i, '').trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || 'D').substring(0, 2).toUpperCase();
}
