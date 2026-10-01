const apiKey = process.env.GEMINI_API_KEY;
async function listModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    console.log("Available models:");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods?.includes("generateContent")) {
        console.log(`- ${m.name} (${m.displayName})`);
      }
    });
  } else {
    console.log("Response:", JSON.stringify(data));
  }
}
listModels();

