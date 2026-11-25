import OpenAI from "openai";
import { ConversationIntelligenceResult } from "../types/crm";

export class ConversationIntelligence {
  /**
   * Analyzes an email reply thread using OpenAI (or fallback rules engine).
   * Strict safety: Never automatically sends replies to prospects.
   */
  public static async analyzeReplyThread(
    contactName: string,
    companyName: string,
    messageContent: string
  ): Promise<ConversationIntelligenceResult> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const openai = new OpenAI({ apiKey });
        const prompt = `Analyze this incoming prospect email reply from ${contactName} at ${companyName}:
"""
${messageContent}
"""

Classify into one of these strict categories:
- Interested
- Not Interested
- Neutral
- Request for Information
- Meeting Request
- Out of Office

Respond strictly in JSON format:
{
  "summary": "1 sentence executive summary of prospect stance",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "classification": "Interested" | "Not Interested" | "Neutral" | "Request for Information" | "Meeting Request" | "Out of Office",
  "serviceRelevance": "Primary service interest or modernization focus",
  "objectionsIdentified": ["list of objections or constraints mentioned"],
  "suggestedNextAction": "Actionable recommendation for human sales representative"
}`;

        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });

        const raw = res.choices[0]?.message?.content;
        if (raw) {
          return JSON.parse(raw) as ConversationIntelligenceResult;
        }
      } catch (err: any) {
        console.warn(`[ConversationIntelligence] OpenAI API call failed: ${err.message}. Using rule-based fallback.`);
      }
    }

    // Rule-based fallback classifier
    const lower = messageContent.toLowerCase();

    if (lower.includes("demo") || lower.includes("meeting") || lower.includes("call") || lower.includes("calendar") || lower.includes("schedule")) {
      return {
        summary: `${contactName} is requesting a discussion to review the proposed architecture.`,
        sentiment: "Positive",
        classification: "Meeting Request",
        serviceRelevance: "Decoupled Web Modernization",
        objectionsIdentified: [],
        suggestedNextAction: "Book a 15-minute discovery call and prepare slide deck."
      };
    }

    if (lower.includes("pricing") || lower.includes("quote") || lower.includes("cost") || lower.includes("budget") || lower.includes("how much")) {
      return {
        summary: `${contactName} requested information on commercial tiers and scope estimates.`,
        sentiment: "Positive",
        classification: "Request for Information",
        serviceRelevance: "Technical Modernization Services",
        objectionsIdentified: ["Pricing sensitivity"],
        suggestedNextAction: "Send customized scope breakdown and case studies."
      };
    }

    if (lower.includes("not interested") || lower.includes("unsubscribe") || lower.includes("remove us") || lower.includes("stop emailing")) {
      return {
        summary: `${contactName} declined services or requested exclusion.`,
        sentiment: "Negative",
        classification: "Not Interested",
        serviceRelevance: "None",
        objectionsIdentified: ["No current need / timing mismatch"],
        suggestedNextAction: "Mark deal as Lost and add to suppression list."
      };
    }

    if (lower.includes("out of office") || lower.includes("on vacation") || lower.includes("auto-reply")) {
      return {
        summary: `Automated Out of Office notification received.`,
        sentiment: "Neutral",
        classification: "Out of Office",
        serviceRelevance: "Pending return",
        objectionsIdentified: [],
        suggestedNextAction: "Pause cadence and reschedule touchpoint upon contact return."
      };
    }

    return {
      summary: `${contactName} sent an inquiry regarding service capabilities.`,
      sentiment: "Positive",
      classification: "Interested",
      serviceRelevance: "Frontend Modernization",
      objectionsIdentified: [],
      suggestedNextAction: "Review inquiry and follow up within 2 business hours."
    };
  }
}
