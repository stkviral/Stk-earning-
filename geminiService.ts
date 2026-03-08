
import { GoogleGenAI, Type } from "@google/genai";
import { User, Transaction } from "./types";

// Fix: Removed module-level initialization to follow guidelines:
// "Create a new GoogleGenAI instance right before making an API call"

export const BackendAI = {
  /**
   * Analyzes user behavior for fraud detection.
   */
  async securityAudit(user: User): Promise<{ riskScore: number; auditLogs: string[] }> {
    try {
      // Fix: Creating instance right before making an API call as per SDK guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const recentTx = (user.transactions || []).slice(0, 5).map(t => `${t.method}: ${t.amount}`).join(", ");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this user session for suspicious activity:
          User: ${user.name}
          IP: ${user.lastIp}
          Device: ${user.deviceId}
          Recent Tx: ${recentTx}
          Risk Score: ${user.riskScore}
          Return JSON: { "riskScore": number (0-100), "auditLogs": ["string", "string"] }`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.NUMBER },
              auditLogs: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["riskScore", "auditLogs"]
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      return { riskScore: user.riskScore, auditLogs: ["Security check failed to connect."] };
    }
  }
};
