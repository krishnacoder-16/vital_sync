import { supabase } from './supabaseClient';
import { createNotification } from './notifications';

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

  if (data && !error) {
    // Notify the doctor about the new appointment request
    const notifResponse = await createNotification({
      userId: doctorId, // Notify the doctor
      title: 'New Appointment Request',
      message: `${patientName} requested an appointment for ${specialization} on ${date} at ${timeSlot}.`,
      type: 'appointment_booked',
    });
    if (notifResponse.error) {
      console.error('[createNotification error]', notifResponse.error);
    }
  }

  return { data, error };
}

/**
 * Update editable fields of an appointment (date, time_slot, notes).
 * Handles the one-time reschedule logic.
 * @param {string} id - The appointment UUID
 * @param {{ date?: string, time_slot?: string, notes?: string }} updates
 * @returns {{ data: object|null, error: object|null }}
 */
export async function updateAppointment(id, updates) {
  // 1. Fetch current appointment to check reschedule status
  const { data: existingAppt, error: fetchError } = await supabase
    .from('appointments')
    .select('is_rescheduled')
    .eq('id', id)
    .single();

  if (fetchError) {
    return { data: null, error: { message: 'Failed to fetch appointment details.' } };
  }

  if (existingAppt.is_rescheduled) {
    return { data: null, error: { message: 'You can only reschedule once' } };
  }

  // 2. Enforce one-time reschedule rules
  const finalUpdates = {
    ...updates,
    status: 'rescheduled',
    is_rescheduled: true,
  };

  const { data, error } = await supabase
    .from('appointments')
    .update(finalUpdates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('[updateAppointment] DB error:', error);
    return { data: null, error };
  }

  if (!data || data.length === 0) {
    console.error('[updateAppointment] 0 rows updated — check RLS policy.');
    return {
      data: null,
      error: { message: 'Permission denied or appointment not found.' },
    };
  }

  return { data: data[0], error: null };
}

/**
 * Update the status of an appointment.
 * Used by doctors to confirm or cancel appointment requests.
 * @param {string} id     - The appointment UUID
 * @param {string} status - "confirmed" | "cancelled"
 * @param {string} [role] - Optional role guard: "patient" | "doctor"
 * @returns {{ data: object|null, error: object|null }}
 */
export async function updateAppointmentStatus(id, status, role) {
  // Role-based guard — patients are not allowed to cancel appointments
  if (role === 'patient' && status === 'cancelled') {
    return {
      data: null,
      error: { message: 'Patients cannot cancel appointments. Please contact your doctor.' },
    };
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) {
    console.error('[updateAppointmentStatus] DB error:', error);
    return { data: null, error };
  }

  // Silent RLS failure: no error but 0 rows were updated
  if (!data || data.length === 0) {
    console.error('[updateAppointmentStatus] 0 rows updated — check RLS policy.');
    return {
      data: null,
      error: { message: 'Permission denied or appointment not found. Check Supabase RLS policy.' },
    };
  }

  const appt = data[0];
  console.log('[updateAppointmentStatus] Success:', appt);

  // Notify the patient about the status change
  if (appt && appt.patient_id) {
    const notifResponse = await createNotification({
      userId: appt.patient_id, // Notify the patient
      title: status === 'confirmed' ? 'Appointment Confirmed' : 'Appointment Cancelled',
      message: status === 'confirmed' 
        ? `Your appointment with ${appt.doctor_name || 'your doctor'} on ${appt.date} at ${appt.time_slot} has been confirmed.`
        : `Your appointment with ${appt.doctor_name || 'your doctor'} on ${appt.date} at ${appt.time_slot} was cancelled.`,
      type: `appointment_${status}`,
    });
    if (notifResponse.error) {
      console.error('[createNotification error]', notifResponse.error);
    }
  }

  return { data: appt, error: null };
}
