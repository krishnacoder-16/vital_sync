// Local heuristic to guess priority for initial rendering without calling API
export function getHeuristicPriority(appt) {
  const s = (appt.notes || appt.specialization || appt.description || "").toLowerCase();
  if (s.includes("chest") || s.includes("pain") || s.includes("emergency") || s.includes("breath")) {
    return "High";
  } else if (s.includes("follow") || s.includes("review")) {
    return "Medium";
  }
  return "Low";
}

export async function getPatientInsights(appointment) {
  try {
    const res = await fetch('/api/ai-doctor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patient_name: appointment.title || appointment.patient_name,
        specialization: appointment.specialization || appointment.condition,
        notes: appointment.description || appointment.notes,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate insights');
    }

    return data;
  } catch (error) {
    console.error('Error fetching patient insights:', error);
    throw error;
  }
}
