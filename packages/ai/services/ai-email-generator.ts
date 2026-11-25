import OpenAI from "openai";
import { BusinessPersonalizationContext, GeneratedEmailDraft } from "../types/email";
import { EmailPromptBuilder } from "../prompts/email-prompt-builder";
import { GeneratedEmailOutputSchema } from "../validators/email-validator";

export class AiEmailGenerator {
  /**
   * Generates a hyper-personalized outbound sales pitch.
   * Leverages OpenAI API when configured, otherwise uses deterministic evidence-grounded synthesis.
   */
  public static async generateEmail(context: BusinessPersonalizationContext): Promise<GeneratedEmailDraft> {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const openai = new OpenAI({ apiKey });
        const systemPrompt = EmailPromptBuilder.buildSystemPrompt();
        const userPrompt = EmailPromptBuilder.buildUserPrompt(context);

        const response = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        });

        const rawJson = response.choices[0]?.message?.content;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          const validated = GeneratedEmailOutputSchema.parse(parsed);

          const fullBodyText = [
            validated.opening,
            "",
            validated.observation,
            "",
            validated.opportunity,
            "",
            validated.servicePitch,
            "",
            validated.closing,
            "",
            validated.signature,
            "",
            "---",
            validated.unsubscribeNotice
          ].join("\n");

          return {
            subject: validated.subject,
            opening: validated.opening,
            observation: validated.observation,
            opportunity: validated.opportunity,
            servicePitch: validated.servicePitch,
            closing: validated.closing,
            signature: validated.signature,
            unsubscribeNotice: validated.unsubscribeNotice,
            fullBodyText,
            metadata: {
              model,
              promptVersion: EmailPromptBuilder.PROMPT_VERSION,
              generatedAt: new Date().toISOString(),
              tone: context.tone,
              targetService: context.targetService,
              evidenceUsed: validated.evidenceCitations
            }
          };
        }
      } catch (err: any) {
        console.warn(`[AiEmailGenerator] OpenAI API request failed: ${err.message}. Generating verified local template.`);
      }
    }

    // Deterministic evidence-grounded template synthesis
    return this.generateDeterministicDraft(context);
  }

  public static generateDeterministicDraft(context: BusinessPersonalizationContext): GeneratedEmailDraft {
    const contactName = context.contactName ? context.contactName.split(" ")[0] : "there";
    const primaryIssue = context.auditSummary?.topVerifiedIssues?.[0];

    let subject = `Modernization opportunities for ${context.businessName}`;
    let observation = `While reviewing ${context.websiteUrl}, our system analyzed page load metrics and interface structures.`;
    let opportunity = `Addressing these bottlenecks creates a seamless customer journey and eliminates friction in your client conversion pipeline.`;

    if (primaryIssue) {
      subject = `Quick note regarding ${primaryIssue.title.toLowerCase()} on ${context.businessName}'s site`;
      observation = `During a technical evaluation of ${context.websiteUrl}, we identified ${primaryIssue.title.toLowerCase()} (Observed: ${primaryIssue.evidence}).`;
      opportunity = `In our experience with ${context.industry} organizations, resolving ${primaryIssue.title.toLowerCase()} directly elevates user retention and Core Web Vitals health.`;
    }

    let servicePitch = `At BrightLoop Technology, we specialize in high-performance frontend engineering and decoupled Next.js modernization.`;
    if (context.targetService === "shopify-ecommerce") {
      servicePitch = `At BrightLoop Technology, we engineer custom Shopify storefronts and optimized checkout experiences.`;
    } else if (context.targetService === "seo-digital-marketing") {
      servicePitch = `At BrightLoop Technology, we build structured data architecture and technical SEO foundations for enterprise reach.`;
    } else if (context.targetService === "custom-software-erp") {
      servicePitch = `At BrightLoop Technology, we develop custom operational portals and automated ERP data synchronizations.`;
    }

    let closing = "Would you be open to a 10-minute discovery call this Thursday to review our technical audit findings?";
    if (context.tone === "concise") {
      closing = "Happy to share the full audit breakdown if you have 5 minutes this week.";
    } else if (context.tone === "friendly") {
      closing = "Let me know if you'd like us to send over the slide teardown, or if you're free for a quick chat soon!";
    }

    const opening = `Hi ${contactName}, hope your week at ${context.businessName} is going well.`;
    const signature = `Best regards,\nBrightLoop Client Solutions Team\nBrightLoop Technology\n100 Pine St, Suite 1250, San Francisco, CA`;
    const unsubscribeNotice = `You received this analysis based on verified public corporate data. If you prefer not to receive technical audits from BrightLoop Technology, reply with 'unsubscribe' to be permanently excluded.`;

    const fullBodyText = [
      opening,
      "",
      observation,
      "",
      opportunity,
      "",
      servicePitch,
      "",
      closing,
      "",
      signature,
      "",
      "---",
      unsubscribeNotice
    ].join("\n");

    return {
      subject,
      opening,
      observation,
      opportunity,
      servicePitch,
      closing,
      signature,
      unsubscribeNotice,
      fullBodyText,
      metadata: {
        model: "deterministic-evidence-synthesizer",
        promptVersion: EmailPromptBuilder.PROMPT_VERSION,
        generatedAt: new Date().toISOString(),
        tone: context.tone,
        targetService: context.targetService,
        evidenceUsed: primaryIssue ? [primaryIssue.evidence] : []
      }
    };
  }
}
