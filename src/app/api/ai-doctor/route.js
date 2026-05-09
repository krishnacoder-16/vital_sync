import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Fail fast at startup if the key is missing in production
if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV === 'production') {
  console.error('[ai-doctor/route] FATAL: GEMINI_API_KEY is not set in production.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { patient_name, specialization, notes } = body;

    // ── Graceful mock when key is absent (dev / CI) ──────────────────────────
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[ai-doctor/route] GEMINI_API_KEY not set — returning mocked response.');

      const s = (notes || specialization || '').toLowerCase();
      let priority = 'Low';
      if (s.includes('chest') || s.includes('pain') || s.includes('emergency') || s.includes('breath')) {
        priority = 'High';
      } else if (s.includes('follow') || s.includes('review')) {
        priority = 'Medium';
      }

      return NextResponse.json({
        summary: `Patient ${patient_name || 'record'} shows symptoms related to ${specialization || 'general concerns'}. Needs evaluation. (Dev mode)`,
        priority,
        suggestion: 'Standard review recommended.',
      });
    }

    // ── Real Gemini call ──────────────────────────────────────────────────────
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    Based on the following patient appointment data:
    Name: ${patient_name || 'Unknown'}
    Specialization: ${specialization || 'General'}
    Notes/Description: ${notes || 'No specific notes provided'}

    Generate:
    1. A short clinical summary (max 2 lines).
    2. Priority level: High, Medium, or Low.
    3. Suggested Action: e.g. "Immediate attention recommended", "Standard review", etc.

    Rules:
    - Chest pain, breathing issues, severe symptoms -> High
    - Emergency symptoms -> High
    - Follow-up, review -> Medium
    - Routine check, mild symptoms -> Low

    Return ONLY strict JSON:
    {
      "summary": "Short summary text here...",
      "priority": "High",
      "suggestion": "Suggested action here..."
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[ai-doctor/route] Unexpected AI response format:', responseText.slice(0, 200));
      throw new Error('Invalid AI response format');
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);
    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('[ai-doctor/route] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
