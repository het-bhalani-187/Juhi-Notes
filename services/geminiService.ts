import { GoogleGenAI, Type } from "@google/genai";
import { MindMapNode } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMindMapData = async (content: string): Promise<MindMapNode> => {
  const ai = getAiClient();
  
  const systemInstruction = `You are an expert at structuring information for visualizations. 
  Convert the provided note content into a hierarchical JSON structure for a mind map.
  
  Rules:
  1. The 'name' of each node must be very short and punchy (1-3 words max).
  2. The root node should be the main title or theme.
  3. Break down complex paragraphs into child nodes.
  4. Max depth of 3 levels to keep the map readable.
  5. Ensure the JSON is valid.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: content,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            children: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  children: {
                    type: Type.ARRAY,
                    items: {
                       type: Type.OBJECT, 
                       properties: {
                          name: { type: Type.STRING },
                          children: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING }
                              }
                            }
                          }
                       }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText) as MindMapNode;
  } catch (error) {
    console.error("Gemini MindMap Error:", error);
    // Fallback if AI fails
    return {
      name: "Analysis Failed",
      children: [
        { name: "Check Connection" },
        { name: "Try simpler text" }
      ]
    };
  }
};

export const generateSubTopics = async (topic: string, context: string): Promise<MindMapNode[]> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: "${context}"\n\nTask: Generate 3-5 distinct, short sub-concepts or related ideas for the topic: "${topic}". Return as a list of nodes.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                name: { type: Type.STRING, description: "Max 3 words" }
             }
          }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text) as MindMapNode[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Sub-topic Error:", error);
    return [{ name: "Error" }];
  }
};

export const analyzeText = async (content: string, instruction: string): Promise<string> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Text to analyze:\n"${content}"\n\nInstruction: ${instruction}`,
      config: {
        systemInstruction: "You are a helpful writing assistant. Provide direct, helpful responses.",
      }
    });
    
    return response.text || "Could not analyze text.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error connecting to AI service.";
  }
};

export const expandText = async (content: string): Promise<string> => {
    return analyzeText(content, "Continue writing this text, maintaining the style and tone. Keep it concise.");
};