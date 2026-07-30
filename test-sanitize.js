const s = `{ "text": "\\n \\frac \\cos \\sin \\theta \\n" }`;
// s is a string containing literal backslashes if read from a file.
// Let's simulate Gemini output by using String.raw
const rawGeminiOutput = String.raw`{ "text": "\n \frac \cos \sin \theta \n" }`;

console.log("Original:", rawGeminiOutput);

let fixed = rawGeminiOutput.replace(/\\([a-zA-Z]+)/g, (match, p1) => {
  if (p1 === 'n' || p1 === 'r' || p1 === 't') {
    return match; // Keep \n, \r, \t as single backslash
  }
  return '\\\\' + p1; // Double escape everything else
});

console.log("Fixed:", fixed);
try {
  console.log("Parsed:", JSON.parse(fixed).text);
} catch (e) {
  console.error("Parse Error:", e.message);
}
