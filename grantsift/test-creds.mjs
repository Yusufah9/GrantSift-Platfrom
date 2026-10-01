import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
  console.log("Testing Gemini API Key with gemini-3.8-flash...");
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    const result = await model.generateContent("Hello, respond with 'OK' if you can hear me.");
    console.log("Gemini 3.8-flash Response:", result.response.text().trim());
  } catch (err) {
    console.error("Gemini 3.8-flash error:", err.message);
  }
}

testGemini();

