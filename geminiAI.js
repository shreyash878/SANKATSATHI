import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeEmergency = async (category, description) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `You are an emergency response AI for SankatSathi India.
Analyze this emergency and reply with ONLY a JSON object, no markdown, no explanation:
{"priority":"critical","isFake":false,"confidence":95,"reason":"explanation here","suggestedAction":"action here"}

Category: ${category}
Description: ${description}

Priority rules:
- critical: life threatening (fire with people trapped, unconscious person, drowning, earthquake, severe injury)
- urgent: serious (flood, road accident, food shortage)  
- normal: non-urgent (shelter needed, general help)
- isFake: true only if description is clearly spam like "test", "abc", "hello"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("No JSON found");
  } catch (err) {
    console.error("Gemini error:", err);
    const critical = ["fire", "burn", "unconscious", "not breathing", "drowning", "earthquake", "trapped", "bleeding", "heart"];
    const urgent = ["flood", "accident", "crash", "injured", "food", "shelter"];
    const desc = description.toLowerCase();
    const priority = critical.some(w => desc.includes(w)) ? "critical" :
                     urgent.some(w => desc.includes(w)) ? "urgent" : "normal";
    return {
      priority,
      isFake: description.length < 5,
      confidence: 70,
      reason: "Rule-based analysis (AI temporarily unavailable)",
      suggestedAction: "Send nearest available volunteer immediately"
    };
  }
};

export const verifyEmergencyImage = async (imageFile) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Convert image to base64
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(imageFile);
    });

    const prompt = `You are an image verification AI for SankatSathi emergency app.

Analyze this image and reply with ONLY a JSON object:
{"isReal": true/false, "confidence": 0-100, "reason": "explanation", "emergency": "what you see"}

Rules:
- isReal: true if this looks like a genuine real-time emergency photo taken by a person
- isReal: false if this looks like:
  * A stock photo or professional photograph
  * Downloaded from internet (too perfect, watermarks, etc.)
  * Clearly unrelated to any emergency
  * A meme, cartoon, or graphic
- confidence: how confident you are (0-100)
- reason: brief explanation
- emergency: what emergency you can see in the image (if any)`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64
        }
      }
    ]);

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("No JSON");
  } catch (err) {
    console.error("Image verification error:", err);
    return {
      isReal: true,
      confidence: 50,
      reason: "Image verification unavailable — manual review needed",
      emergency: "Unknown"
    };
  }
};