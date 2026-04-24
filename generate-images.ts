import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const plans = [
  { id: 1, prompt: "A sleek, modern office desk setup with a high-end laptop, wireless charger, and minimalist tech accessories, professional lighting, photorealistic." },
  { id: 2, prompt: "Premium pet products on a clean wooden floor, including a stylish bamboo dog bowl and a cozy pet bed, warm lighting, photorealistic." },
  { id: 3, prompt: "High-end apparel accessories, stylish wooden sunglasses and a silk scarf arranged elegantly on a textured sweater, photorealistic." },
  { id: 4, prompt: "A pair of elegant wooden desk lamps with warm glowing bulbs on a modern table, cozy atmosphere, photorealistic." },
  { id: 5, prompt: "A luxurious bath and spa setup with a bamboo bath mat, wooden soap dispenser, and a small potted plant on white marble, photorealistic." },
  { id: 6, prompt: "Outdoor living accessories, a stylish wooden lantern and a small succulent plant on a wooden stool, natural sunlight, photorealistic." }
];

async function generate() {
  for (const plan of plans) {
    console.log(`Generating image for plan ${plan.id}...`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: plan.prompt }],
        },
      });
      
      let base64Data = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }
      
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(path.join(process.cwd(), 'public', `plan-${plan.id}.png`), buffer);
        console.log(`Saved plan-${plan.id}.png`);
      } else {
        console.log(`No image data found for plan ${plan.id}`);
      }
    } catch (e) {
      console.error(`Error generating plan ${plan.id}:`, e);
    }
  }
}

generate();
