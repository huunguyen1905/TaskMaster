import { GoogleGenAI, Type } from "@google/genai";
import { Subtask, Task } from '../types';

// Khởi tạo Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface InsightReport {
  projectHealthScore: number; // 0 - 100
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  observations: {
    type: 'risk' | 'success' | 'info';
    title: string;
    description: string;
  }[];
  actionPlan: string[];
}

export const aiService = {
  /**
   * Gọi Gemini để sinh danh sách công việc con (Subtasks)
   */
  generateSubtasks: async (taskTitle: string): Promise<Subtask[]> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Hãy đóng vai Project Manager, tạo danh sách 5 subtasks ngắn gọn, hành động cụ thể cho công việc: "${taskTitle}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                done: { type: Type.BOOLEAN }
              },
              required: ["text", "done"]
            }
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as Subtask[];
      }
      return [];
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return [];
    }
  },

  /**
   * Phân tích danh sách tasks để tạo báo cáo JSON structured
   */
  generateInsightReport: async (tasks: Task[]): Promise<InsightReport | null> => {
    try {
      // 1. Tóm tắt dữ liệu
      const summaryData = tasks.map(t => 
        `[${t.id}] ${t.title} | Status: ${t.status} | Priority: ${t.priority} | Due: ${t.dueDate ? t.dueDate.slice(0,10) : 'N/A'} | Assignee: ${t.assignees.join(',') || t.author}`
      ).join('\n');

      // 2. Gọi Gemini với Schema JSON
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Dữ liệu dự án:
          ${summaryData}

          Vai trò: Senior Project Manager.
          Nhiệm vụ: Phân tích dữ liệu và trả về báo cáo JSON.
          
          Yêu cầu phân tích:
          1. Đánh giá "projectHealthScore" từ 0-100 dựa trên số lượng task quá hạn, task khẩn cấp chưa làm, và tiến độ chung.
          2. Tạo "observations":
             - Tìm "risk": Task quá hạn, dồn việc vào 1 người, task priority cao bị kẹt.
             - Tìm "success": Tiến độ tốt, hoàn thành task khó.
          3. Đề xuất "actionPlan": 3-4 hành động cụ thể, ngắn gọn để cải thiện tình hình.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectHealthScore: { type: Type.INTEGER, description: "Điểm sức khỏe dự án 0-100" },
              summary: { type: Type.STRING, description: "Tóm tắt tổng quan tình hình trong 1 câu" },
              sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
              observations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["risk", "success", "info"] },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["type", "title", "description"]
                }
              },
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Danh sách các hành động cụ thể cần làm ngay"
              }
            },
            required: ["projectHealthScore", "summary", "sentiment", "observations", "actionPlan"]
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as InsightReport;
      }
      return null;
    } catch (error) {
      console.error("Gemini Insight Error:", error);
      return null;
    }
  }
};