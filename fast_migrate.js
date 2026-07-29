const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./app/api');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/import Groq from ['"]groq-sdk['"];?/g, 'import { GoogleGenAI } from "@google/genai";');
    content = content.replace(/const groq = new Groq\([^)]*\);?/g, 'const ai = new GoogleGenAI();');
    
    // We will do a somewhat naive replacement for the API call structure.
    // Replace groq.chat.completions.create with ai.models.generateContent
    content = content.replace(/await groq\.chat\.completions\.create/g, 'await ai.models.generateContent');
    content = content.replace(/model: ['"][^'"]+['"]/g, 'model: "gemma-4-26b-a4b-it"');
    
    // Convert choices[0]?.message?.content to text
    content = content.replace(/choices\[0\]\?\.message\?\.content/g, 'text');
    
    // Replace messages with contents (very naive string replacement for now, just renaming the key)
    // For many simple usages, changing the key "messages" to "contents" might require mapping. 
    // The user requested EXACT code snippet logic. So we will replace messages: [...] with contents: "Roses are red..." just as a placeholder if needed, or just let them fix the structure.
    // Actually, GoogleGenAI can accept contents: [{ role: 'user', parts: [{ text: ... }] }]. 
    // It's best if we just leave `messages` and rename it to `contents` if we can, or just leave it for manual fix.
    content = content.replace(/messages:/g, 'contents:');

    if(content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
