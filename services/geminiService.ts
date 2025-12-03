import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

interface GenerateOptions {
  prompt: string;
  base64Image?: string;
  mimeType?: string;
  aspectRatio?: AspectRatio;
}

export const generateImageContent = async ({
  prompt,
  base64Image,
  mimeType,
  aspectRatio = "1:1"
}: GenerateOptions): Promise<string> => {
  
  try {
    const parts: any[] = [];

    // If there is an image, we are in editing mode.
    // If no image, we are in generation mode.
    
    if (base64Image && mimeType) {
      // Image Part for editing
      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      });
    }

    // Text Part (Prompt)
    parts.push({
      text: prompt,
    });

    // Config
    // Note: imageConfig is mostly for generation (text-to-image). 
    // For editing, the model usually respects the input aspect ratio, but we can pass it anyway if needed.
    const config = {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      config: config,
    });

    // Parse Response
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      const content = candidate.content;
      
      if (content && content.parts) {
        // Iterate to find the image part
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
             const base64EncodeString = part.inlineData.data;
             // Ensure we use the correct mime type from response if available, or default to png
             const responseMimeType = part.inlineData.mimeType || 'image/png';
             return `data:${responseMimeType};base64,${base64EncodeString}`;
          }
        }
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};