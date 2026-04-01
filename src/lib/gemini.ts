import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

export async function generateContentWithRetry(
  params: GenerateContentParameters,
  apiKey: string
): Promise<GenerateContentResponse> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      const isRateLimit = error?.message?.includes('429') || 
                          error?.status === 'RESOURCE_EXHAUSTED' ||
                          JSON.stringify(error).includes('429');
      
      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt);
        console.warn(`Gemini API rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If not a rate limit error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError;
}
