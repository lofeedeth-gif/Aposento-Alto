import { GoogleGenAI, Type } from "@google/genai";
import { BibleChapter, Devotional, ExegesisResult, StudyPlan } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON string if the model returns markdown code blocks or conversational text
const cleanJson = (text: string) => {
  if (!text) return '{}';
  // Remove markdown code blocks
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // Find the first '{'
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) return '{}';
  
  // Find the last '}'
  const lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace === -1 || lastBrace <= firstBrace) return '{}';
  
  // Extract the JSON object
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  
  return cleaned;
};

export const fetchDailyDevotional = async (): Promise<Devotional> => {
  try {
    // Switching to flash-preview for speed and reliability with simpler JSON tasks
    const model = "gemini-3-flash-preview"; 
    const today = new Date().toLocaleDateString('es-ES');
    const prompt = `
      Genera un devocional cristiano para hoy (${today}). 
      Formato JSON estricto:
      {
        "date": "${today}",
        "verse": "Texto del versículo (RV1960)",
        "reference": "Libro Capítulo:Versículo",
        "reflection": "Reflexión profunda de 3 párrafos cortos (máximo 150 palabras). Usa \\n para saltos de línea dentro del string.",
        "questions": ["Pregunta 1", "Pregunta 2", "Pregunta 3"]
      }
      Responde ÚNICAMENTE con el JSON.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
        // Removing responseSchema here to allow the model more flexibility in text formatting within the JSON
        // which often prevents "Unterminated string" errors caused by strict schema validation truncation.
      }
    });

    const cleanedText = cleanJson(response.text || '{}');
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating devotional:", error);
    // Fallback static content in case of error
    return {
      date: new Date().toISOString(),
      verse: "Jehová es mi pastor; nada me faltará.",
      reference: "Salmos 23:1",
      reflection: "El Señor cuida de nosotros con la ternura de un pastor. En medio de la incertidumbre, su vara y su cayado nos infunden aliento. Descansa hoy en Su provisión. (Modo offline)",
      questions: ["¿En qué área necesito confiar más?", "¿He sentido su cuidado recientemente?", "¿Cómo puedo ser pastor para otros?"]
    };
  }
};

export const fetchBibleChapter = async (book: string, chapter: number, version: string, language: string): Promise<BibleChapter> => {
  try {
    const model = "gemini-3-pro-preview"; // Keeping Pro for accuracy in scripture
    const prompt = `
      Actúa como una API de la Biblia. Devuelve el texto completo de ${book} capítulo ${chapter} en la versión ${version} idioma ${language}.
      Es CRÍTICO que el texto sea exacto a la versión solicitada.
      Responde SOLO con JSON.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        maxOutputTokens: 8192, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            book: { type: Type.STRING },
            chapter: { type: Type.INTEGER },
            version: { type: Type.STRING },
            verses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  verse: { type: Type.INTEGER },
                  text: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    
    const data = JSON.parse(cleanJson(response.text || '{}'));
    if (!data.verses || !Array.isArray(data.verses)) {
        console.error("Invalid format received from AI", data);
        return {
          book, chapter, version, 
          verses: [{ verse: 1, text: "Hubo un error al procesar el formato del capítulo. Intenta recargar." }]
        };
    }
    return data;
  } catch (error) {
    console.error("Error fetching bible text:", error);
    return {
      book, chapter, version, verses: [{ verse: 1, text: "Error al cargar el capítulo. Por favor intenta de nuevo. (Error de conexión o timeout)" }]
    };
  }
};

export const getVerseExegesis = async (reference: string, text: string): Promise<ExegesisResult> => {
  try {
    const model = "gemini-3-pro-preview"; 
    const prompt = `
      Actúa como un experto teólogo y exégeta bíblico. Analiza el siguiente versículo:
      "${text}" (${reference})
      
      Provee:
      1. Contexto histórico (muy breve).
      2. Significado teológico.
      3. Aplicación práctica (Peso de Fe).
      
      Responde en JSON:
      {
        "context": "...",
        "theology": "...",
        "application": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
        responseMimeType: "application/json"
        // Implicit schema via prompt is often more robust for free-text fields
      }
    });

    return JSON.parse(cleanJson(response.text || '{}'));
  } catch (error) {
    return { context: "No disponible", theology: "No disponible", application: "No disponible" };
  }
};

export const generateStudyPlan = async (topic: string): Promise<StudyPlan> => {
  try {
    const model = "gemini-3-pro-preview";
    const prompt = `
      Crea un plan de estudio bíblico profundo sobre el tema: "${topic}".
      Incluye una introducción, 5 referencias cruzadas clave con explicación, y una conclusión.
      
      Responde en JSON con la estructura:
      {
        "topic": "...",
        "introduction": "...",
        "references": [{ "reference": "...", "description": "..." }],
        "conclusion": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(cleanJson(response.text || '{}'));
  } catch (error) {
    console.error("Study plan error:", error);
    throw new Error("Failed to generate study plan");
  }
};

export const getBibleDictionaryDefinition = async (term: string): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Define el término bíblico "${term}" de manera concisa pero profunda, citando referencias si es necesario.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt
    });
    return response.text || "Definición no encontrada.";
}