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

export async function generateWithGemma(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemma-4-26b-a4b-it",
    contents: prompt,
  });
  return response.text;
}

export async function streamWithGemma(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const stream = await ai.models.generateContentStream({
    model: "gemma-4-26b-a4b-it",
    contents: prompt,
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
}
