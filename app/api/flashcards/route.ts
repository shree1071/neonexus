import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI();

export async function POST(req: Request) {
  try {
    const { notes, count } = await req.json();
    const numCards = count || 5;

    const systemPrompt = `
      You are an automated Study Assistant.
      Create exactly ${numCards} flashcards based on the user's physics notes.
      Output format must be valid JSON:
      { "cards": [{ "front": "Question?", "back": "Answer" }] }
    `;

    const completion = await ai.models.generateContent({
      contents: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: notes }
      ],
      model: "gemma-4-26b-a4b-it",
      response_format: { type: 'json_object' }
    });

    const data = JSON.parse(completion.text || '{ "cards": [] }');
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ cards: [{ front: "Error", back: "Could not generate cards." }] });
  }
}