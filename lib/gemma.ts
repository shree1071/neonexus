import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI();

export async function testGemma() {
  const response = await ai.models.generateContent({
    model: "gemma-4-26b-a4b-it",
    contents: "Roses are red...",
  });
  console.log(response.text);
  return response.text;
}
