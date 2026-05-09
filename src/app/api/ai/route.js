import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Fail fast at startup if the key is missing in production
if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV === 'production') {
  console.error('[ai/route] FATAL: GEMINI_API_KEY is not set in production.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.symptoms) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 });
    }

    const { symptoms } = body;

    // ── Graceful mock when key is absent (dev / CI) ──────────────────────────
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[ai/route] GEMINI_API_KEY not set — returning mocked response.');

      const s = symptoms.toLowerCase();
      let mockSpecialization = 'General Physician';
      if (s.includes('chest') || s.includes('breath') || s.includes('heart')) mockSpecialization = 'Cardiologist';
      else if (s.includes('headache') || s.includes('brain') || s.includes('nerve')) mockSpecialization = 'Neurologist';
      else if (s.includes('skin') || s.includes('rash') || s.includes('itch')) mockSpecialization = 'Dermatologist';
      else if (s.includes('bone') || s.includes('joint') || s.includes('knee')) mockSpecialization = 'Orthopedist';
      else if (s.includes('stomach') || s.includes('digest') || s.includes('pain')) mockSpecialization = 'Gastroenterologist';

      return NextResponse.json({
        specialization: mockSpecialization,
        reason: `Based on your symptoms, a ${mockSpecialization} is best equipped to evaluate your condition. (Dev mode — add GEMINI_API_KEY to .env.local for real AI responses)`,
      });
    }

    // ── Real Gemini call ──────────────────────────────────────────────────────
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    User symptoms: ${symptoms}
    Suggest:
    1. The most relevant medical specialization from this EXACT list ONLY:
       [Cardiologist, Pulmonologist, Neurologist, Orthopedist, General Physician, Pediatrician, Dermatologist, Psychiatrist, Gastroenterologist, Ophthalmologist, ENT Specialist, Gynecologist, Urologist, Endocrinologist, Oncologist]
       (For severe emergencies like chest pain/breathing issues, select Cardiologist, Pulmonologist, or General Physician.)
    2. Short explanation (max 2 lines).

    Return ONLY strict JSON:
    {
      "specialization": "SpecializationName",
      "reason": "Brief explanation..."
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[ai/route] Unexpected AI response format:', responseText.slice(0, 200));
      throw new Error('Invalid response format from AI');
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);
    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('[ai/route] Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms. Please try again.' },
      { status: 500 }
    );
  }
}
