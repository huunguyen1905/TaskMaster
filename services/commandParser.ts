import { GoogleGenAI } from "@google/genai";
import { Task } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:audio/webm;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getSystemContext = () => {
    const now = new Date();
    return `
        Current Date/Time: ${now.toLocaleString('vi-VN')} (${now.getDay() === 0 ? 'Sunday' : 'Weekday'}).
        
        Allowed Priorities: "Thấp", "Trung bình", "Cao", "Khẩn cấp".
        Allowed Statuses: "Cần làm", "Đang làm", "Chờ duyệt", "Hoàn thành".
        
        Instructions:
        1. Analyze the input to extract task details.
        2. Map 'priority' keywords (e.g., urgent, gấp, !) to Allowed Priorities. Default to "Trung bình".
        3. Extract 'dueDate' relative to Current Date/Time in ISO format.
        4. Extract 'assignees' if mentioned.
        5. Extract 'title' and 'description'.
    `;
};

export const commandParser = {
  /**
   * Parse natural language command into a structured Task object
   * @param text User input (e.g., "Meeting with design team tomorrow at 10am #High")
   * @returns Partial Task object
   */
  parseCommand: async (text: string): Promise<Partial<Task>> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          System: You are a smart task parser.
          Context: ${getSystemContext()}
          Input: "${text}"
          
          Output: Return ONLY a valid JSON object with keys: title, description, priority, status, dueDate, assignees (array of strings).
          Do not wrap in markdown code blocks.
        `,
        config: {
          responseMimeType: "application/json"
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as Partial<Task>;
      }
      
      throw new Error("Empty response from AI");
    } catch (error) {
      console.error("Command Parser Error:", error);
      throw error;
    }
  },

  /**
   * Parse multiple lines of text into an array of Task objects
   * @param text Bulk text input
   * @returns Array of Partial Task objects
   */
  parseBulkText: async (text: string): Promise<Partial<Task>[]> => {
      try {
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `
                System: You are a bulk task parser.
                Context: ${getSystemContext()}
                Input:
                """
                ${text}
                """
                
                Output: Return ONLY a valid JSON ARRAY of objects. Each object must have keys: title, description, priority, status, dueDate, assignees (array of strings).
                Do not wrap in markdown code blocks.
              `,
              config: {
                  responseMimeType: "application/json"
              }
          });

          if (response.text) {
              return JSON.parse(response.text) as Partial<Task>[];
          }
          return [];
      } catch (error) {
          console.error("Bulk Parser Error:", error);
          throw error;
      }
  },

  /**
   * Parse audio command into a structured Task object
   * @param audioBlob Recorded audio blob
   * @returns Partial Task object
   */
  parseAudioCommand: async (audioBlob: Blob): Promise<Partial<Task>> => {
      try {
          const audioBase64 = await blobToBase64(audioBlob);
          
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-native-audio-preview-12-2025', // Supports native audio input
              contents: {
                  parts: [
                      {
                          inlineData: {
                              mimeType: audioBlob.type || 'audio/webm',
                              data: audioBase64
                          }
                      },
                      {
                          text: `
                            System: Listen to the audio command and extract task details.
                            Context: ${getSystemContext()}
                            
                            Output: Return ONLY a valid JSON object with keys: title, description, priority, status, dueDate, assignees (array of strings).
                          `
                      }
                  ]
              },
              config: {
                  responseMimeType: "application/json"
              }
          });

          if (response.text) {
              return JSON.parse(response.text) as Partial<Task>;
          }

          throw new Error("Empty response from AI");
      } catch (error) {
          console.error("Audio Command Parser Error:", error);
          throw error;
      }
  }
};