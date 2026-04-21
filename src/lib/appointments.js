import { supabase } from './supabaseClient';

/**
 * Fetch all appointments for a logged-in patient.
 * @param {string} userId - The authenticated user's UUID
 * @returns {{ data: Array, error: object|null }}
 */
export async function getAppointmentsByPatient(userId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', userId)
    .order('date', { ascending: true });

  return { data: data || [], error };
}

/**
 * Fetch all appointments for a doctor using their auth user UUID.
 * @param {string} doctorId - The doctor's auth user UUID
 * @returns {{ data: Array, error: object|null }}
 */
export async function getAppointmentsByDoctor(doctorId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('date', { ascending: true })
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
        doctor_id: doctorId,       // UUID of the doctor's auth user
        doctor_name: doctorName,   // Display name stored for convenience
        specialization,
        date,
        time_slot: timeSlot,
        notes: notes || null,
        status: 'scheduled',
      },
    ])
    .select()
    .single();

  return { data, error };
}

/**
 * Update the status of an appointment.
 * Used by doctors to confirm or cancel appointment requests.
 * @param {string} id - The appointment UUID
 * @param {string} status - "confirmed" | "cancelled"
 * @returns {{ error: object|null }}
 */
export async function updateAppointmentStatus(id, status) {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);

  return { error };
}
