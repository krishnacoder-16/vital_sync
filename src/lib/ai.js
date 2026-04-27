export async function getDoctorSuggestion(symptoms) {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to analyze symptoms');
    }

    return data;
  } catch (error) {
    console.error('Error fetching doctor suggestion:', error);
    throw error;
  }
}
