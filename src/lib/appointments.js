import { supabase } from './supabaseClient';

/**
 * Fetch all appointments for a logged-in patient.
 * @param {string} userId - The authenticated user's UUID
 * @returns {{ data: Array, error: object|null }}
 */
export async function getAppointments(userId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', userId)
    .order('date', { ascending: true });

  return { data: data || [], error };
}

/**
 * Fetch appointments for today across all patients (for doctor view).
 * Since doctors are not yet stored in the DB with IDs, we filter by doctor_name.
 * @param {string} doctorName - Display name of the doctor
 * @returns {{ data: Array, error: object|null }}
 */
export async function getDoctorTodaySchedule(doctorName) {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_name', doctorName)
    .eq('date', today)
    .order('time_slot', { ascending: true });

  return { data: data || [], error };
}

/**
 * Insert a new appointment into Supabase.
 * @param {object} appointmentData
 * @returns {{ data: object|null, error: object|null }}
 */
export async function createAppointment({
  userId,
  patientName,
  doctorId,
  doctorName,
  specialization,
  date,
  timeSlot,
  notes,
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        patient_id: userId,
        patient_name: patientName,
        doctor_id: doctorId,
        doctor_name: doctorName,
        specialization,
        date,
        time_slot: timeSlot,
        notes: notes || null,
        status: 'pending',
      },
    ])
    .select()  // Return the inserted row so UI can update instantly
    .single();

  return { data, error };
}
