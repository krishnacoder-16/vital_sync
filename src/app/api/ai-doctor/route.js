import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MOCK_KEY');

export async function POST(req) {
  try {
    const { patient_name, specialization, notes } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      let priority = "Low";
      const s = (notes || specialization || "").toLowerCase();
      if (s.includes("chest") || s.includes("pain") || s.includes("emergency") || s.includes("breath")) {
        priority = "High";
      } else if (s.includes("follow") || s.includes("review")) {
        priority = "Medium";
      }

      return NextResponse.json({
        summary: `Patient ${patient_name || 'record'} shows symptoms related to ${specialization || 'general concerns'}. Needs evaluation. (Mocked AI)`,
        priority: priority
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

    Return ONLY strict JSON format:
    {
      "summary": "Short summary text here...",
      "priority": "High",
      "suggestion": "Suggested action here..."
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");

    const jsonResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('AI Doctor API Error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
