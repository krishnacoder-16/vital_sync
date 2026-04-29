/**
 * Smart appointment/time filter utility for VitalSync search.
 *
 * Supports:
 *  - Exact text matching on any field
 *  - Partial time matching: "10" → "10:00 AM"
 *  - AM/PM shorthand: "AM", "PM"
 *  - Time-of-day aliases:
 *    "morning"   → 06:00–11:59 AM
 *    "afternoon" → 12:00–04:59 PM
 *    "evening"   → 05:00–08:59 PM
 *    "night"     → 09:00 PM–05:59 AM
 */

/**
 * Returns true if the given time_slot string matches the search query,
 * including smart aliases like "morning", "afternoon", "evening", "night".
 *
 * @param {string} timeSlot  e.g. "10:00 AM", "02:30 PM"
 * @param {string} query     normalized (lowercase, trimmed) search query
 */
export function matchesTimeQuery(timeSlot, query) {
  if (!timeSlot || !query) return false;

  const slot = timeSlot.toLowerCase();

  // Direct substring match (handles "10", "AM", "11:30", etc.)
  if (slot.includes(query)) return true;

  // Parse hour for alias matching
  const match = slot.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return false;

  let hour = parseInt(match[1], 10);
  const period = (match[3] || '').toLowerCase();

  // Convert to 24h for easier range checks
  if (period === 'pm' && hour !== 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;

  if (query === 'morning')   return hour >= 6  && hour < 12;
  if (query === 'afternoon') return hour >= 12 && hour < 17;
  if (query === 'evening')   return hour >= 17 && hour < 21;
  if (query === 'night')     return hour >= 21 || hour < 6;
  if (query === 'am')        return hour >= 0  && hour < 12;
  if (query === 'pm')        return hour >= 12 && hour < 24;

  return false;
}

/**
 * Returns true if a patient-side appointment matches the query.
 * Matches on: doctor_name, specialization, time_slot (smart), date
 *
 * @param {object} appt  appointment row from Supabase
 * @param {string} q     normalized (lowercase, trimmed) query
 */
export function appointmentMatchesPatient(appt, q) {
  if (!q) return true;
  return (
    (appt.doctor_name     || '').toLowerCase().includes(q) ||
    (appt.specialization  || '').toLowerCase().includes(q) ||
    (appt.date            || '').toLowerCase().includes(q) ||
    matchesTimeQuery(appt.time_slot, q)
  );
}

/**
 * Returns true if a doctor-side appointment matches the query.
 * Matches on: patient_name (title), specialization (description), time_slot (smart)
 *
 * @param {object} appt  display-formatted appointment object
 * @param {string} q     normalized (lowercase, trimmed) query
 */
export function appointmentMatchesDoctor(appt, q) {
  if (!q) return true;
  return (
    (appt.title       || '').toLowerCase().includes(q) ||
    (appt.description || '').toLowerCase().includes(q) ||
    (appt.status      || '').toLowerCase().includes(q) ||
    matchesTimeQuery(appt.time, q)
  );
}

/**
 * Returns true if a doctor profile matches the patient's search.
 * Matches on: name, specialization, location
 *
 * @param {object} doctor  doctor profile row from Supabase
 * @param {string} q       normalized (lowercase, trimmed) query
 */
export function doctorMatchesQuery(doctor, q) {
  if (!q) return true;
  return (
    (doctor.name           || '').toLowerCase().includes(q) ||
    (doctor.specialization || '').toLowerCase().includes(q) ||
    (doctor.location       || '').toLowerCase().includes(q)
  );
}

/**
 * Returns true if a patient record matches the doctor's search.
 * Matches on: name, condition/specialization
 *
 * @param {object} patient  derived patient object
 * @param {string} q        normalized (lowercase, trimmed) query
 */
export function patientMatchesQuery(patient, q) {
  if (!q) return true;
  return (
    (patient.name      || '').toLowerCase().includes(q) ||
    (patient.condition || '').toLowerCase().includes(q)
  );
}
