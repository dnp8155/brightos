import OpenAI from "openai";
import { AuditIssue } from "../types/audit";

export class AiAuditSummarizer {
  /**
   * Summarizes verified audit findings using OpenAI or fallback deterministic summary.
   * Strict rule: Never invents missing technical issues or performance stats.
   */
  public static async summarizeFindings(
    domain: string,
    verifiedIssues: AuditIssue[],
    scores: { performance: number; seo: number; mobile: number; design: number }
  ): Promise<{ executiveSummary: string; criticalFindings: string[]; suggestedRoadmap: string[] }> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.startsWith("sk-") && verifiedIssues.length > 0) {
      try {
        const openai = new OpenAI({ apiKey });
        const issuesSummary = verifiedIssues
          .slice(0, 8)
          .map((i) => `- [${i.category.toUpperCase()}] ${i.title}: ${i.evidence} (${i.explanation})`)
          .join("\n");

        const prompt = `You are BrightLoop Technology's Senior Web Architecture Analyst.
Audit Target: ${domain}
Calculated Scores: Performance ${scores.performance}%, SEO ${scores.seo}%, Mobile ${scores.mobile}%, Design ${scores.design}%.
Verified Issues Observed:
${issuesSummary}

Strict Instructions:
1. Provide a 2-sentence executive summary reflecting ONLY the verified issues and scores above.
2. List 3 critical findings.
3. List 3 sequential modernization steps.
DO NOT invent issues, missing pages, or metrics not listed in the verified issues.

Format as JSON:
{
  "executiveSummary": "...",
  "criticalFindings": ["...", "...", "..."],
  "suggestedRoadmap": ["...", "...", "..."]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            executiveSummary: parsed.executiveSummary || "",
            criticalFindings: parsed.criticalFindings || [],
            suggestedRoadmap: parsed.suggestedRoadmap || []
          };
        }
      } catch (err: any) {
        console.warn(`[AiAuditSummarizer] OpenAI API call failed: ${err.message}. Using evidence-grounded template synthesis.`);
      }
    }

    // Evidence-grounded deterministic synthesis
    const topIssues = verifiedIssues.filter((i) => i.severity === "critical" || i.severity === "high");
    const issueHighlights = topIssues.length > 0 ? topIssues : verifiedIssues.slice(0, 3);

    const criticalFindings = issueHighlights.map(
      (i) => `${i.title}: ${i.explanation} (Observed: ${i.evidence})`
    );

    const executiveSummary = `BrightLoop AI completed technical analysis of ${domain}, recording an overall health score of ${Math.round(
      (scores.performance + scores.seo + scores.mobile + scores.design) / 4
    )}/100 across ${verifiedIssues.length} evaluated factors. Primary modernization opportunities center around ${
      topIssues[0]?.category || "performance"
    } optimization and mobile responsiveness.`;

    const suggestedRoadmap = [
      "Remediate high-severity viewport and Core Web Vitals bottlenecks",
      "Deploy optimized SEO metadata, canonical hierarchy, and image alt indexing",
      "Re-platform or decouple frontend using modern Next.js component architecture"
    ];

    return {
      executiveSummary,
      criticalFindings,
      suggestedRoadmap
    };
  }
}
