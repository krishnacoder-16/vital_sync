import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

export async function POST(req) {
  try {
    const { symptoms } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Returning a mocked AI response.");
      
      let mockSpecialization = "General Physician";
      const s = symptoms.toLowerCase();
      
      if (s.includes("chest") || s.includes("breath") || s.includes("heart")) mockSpecialization = "Cardiologist";
      if (s.includes("headache") || s.includes("brain") || s.includes("nerve")) mockSpecialization = "Neurologist";
      if (s.includes("skin") || s.includes("rash") || s.includes("itch")) mockSpecialization = "Dermatologist";
      if (s.includes("bone") || s.includes("joint") || s.includes("knee")) mockSpecialization = "Orthopedist";
      if (s.includes("stomach") || s.includes("digest") || s.includes("pain")) mockSpecialization = "Gastroenterologist";

      return NextResponse.json({
        specialization: mockSpecialization,
        reason: `Based on your symptoms, a ${mockSpecialization} is best equipped to evaluate your condition and provide appropriate care. (Mocked response - Add GEMINI_API_KEY to .env.local)`
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    User symptoms: ${symptoms}
    Suggest:
    1. The most relevant medical specialization from this EXACT list ONLY: 
       [Cardiologist, Pulmonologist, Neurologist, Orthopedist, General Physician, Pediatrician, Dermatologist, Psychiatrist, Gastroenterologist, Ophthalmologist, ENT Specialist, Gynecologist, Urologist, Endocrinologist, Oncologist]
       (If it is a severe emergency like chest pain/breathing issues, STILL select "Cardiologist" or "Pulmonologist" or "General Physician" instead of "Emergency Medicine").
    2. Short explanation (max 2 lines).

    Return strictly in JSON format:
    {
      "specialization": "SpecializationName",
      "reason": "Brief explanation..."
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON in case the model returns markdown like \`\`\`json ... \`\`\`
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze symptoms. Please try again.' }, { status: 500 });
  }
}
