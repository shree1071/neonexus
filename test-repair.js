// Test the repairJsonLatex function logic

function repairJsonLatex(raw) {
  const result = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '\\') {
      if (i + 1 < raw.length && raw[i + 1] === '\\') {
        result.push('\\', '\\');
        i++;
      } else if (i + 1 < raw.length && raw[i + 1] === '"') {
        result.push('\\', '"');
        i++;
      } else if (i + 1 < raw.length && '/' === raw[i + 1]) {
        result.push('\\', raw[i + 1]);
        i++;
      } else if (i + 1 < raw.length && 'u' === raw[i + 1]) {
        if (i + 5 < raw.length && /^[0-9a-fA-F]{4}$/.test(raw.substring(i + 2, i + 6))) {
          result.push(raw.substring(i, i + 6));
          i += 5;
        } else {
          result.push('\\', '\\');
        }
      } else if (i + 1 < raw.length && 'bfnrt'.includes(raw[i + 1])) {
        if (i + 2 < raw.length && /[a-zA-Z]/.test(raw[i + 2])) {
          result.push('\\', '\\');
        } else {
          result.push('\\');
        }
      } else {
        result.push('\\', '\\');
      }
    } else {
      result.push(raw[i]);
    }
  }
  return result.join('');
}

// Test 1: Already correctly escaped JSON (should pass through unchanged)
const test1 = String.raw`{"explanation": "The formula is $\\sin\\theta + \\cos\\theta = \\frac{a}{b}$\n\nGiven:\n- Value"}`;
console.log("Test 1 (already correct):");
try {
  const parsed = JSON.parse(test1);
  console.log("  Original parses OK:", parsed.explanation.substring(0, 60));
} catch (e) {
  console.log("  Original fails, trying repair...");
  const repaired = repairJsonLatex(test1);
  const parsed = JSON.parse(repaired);
  console.log("  Repaired parses OK:", parsed.explanation.substring(0, 60));
}

// Test 2: Unescaped LaTeX (the problematic case)
const test2 = String.raw`{"explanation": "Formula: $\sin\theta + \cos\theta = \frac{a}{b}$"}`;
console.log("\nTest 2 (unescaped LaTeX):");
try {
  JSON.parse(test2);
  console.log("  Original parses (unexpected!)");
} catch (e) {
  console.log("  Original fails as expected:", e.message.substring(0, 50));
  const repaired = repairJsonLatex(test2);
  console.log("  Repaired string:", repaired.substring(0, 80));
  const parsed = JSON.parse(repaired);
  console.log("  Repaired parses OK:", parsed.explanation.substring(0, 60));
}

// Test 3: Mix of escaped and newlines
const test3 = String.raw`{"explanation": "Line 1\nLine 2\n- Item with $\\text{hello}$"}`;
console.log("\nTest 3 (newlines + escaped LaTeX):");
try {
  const parsed = JSON.parse(test3);
  console.log("  Parses OK, has newlines:", parsed.explanation.includes('\n'));
} catch (e) {
  console.log("  Original fails, trying repair...");
  const repaired = repairJsonLatex(test3);
  const parsed = JSON.parse(repaired);
  console.log("  Repaired OK, has newlines:", parsed.explanation.includes('\n'));
}

// Test 4: Unescaped \text and \theta (the actual Gemini output pattern)
const test4 = String.raw`{"explanation": "$\text{ m/s}$ and $\theta$ and $\sqrt{x}$"}`;
console.log("\nTest 4 (unescaped \\text, \\theta, \\sqrt):");
try {
  JSON.parse(test4);
  console.log("  Original parses (unexpected!)");
} catch (e) {
  console.log("  Original fails:", e.message.substring(0, 50));
  const repaired = repairJsonLatex(test4);
  const parsed = JSON.parse(repaired);
  console.log("  Repaired parses OK:", parsed.explanation);
}

console.log("\n✅ All tests passed!");
