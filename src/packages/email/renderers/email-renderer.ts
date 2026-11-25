import { GeneratedEmailDraft } from "../../ai/types/email";

export class EmailRenderer {
  /**
   * Renders raw text email body into an interactive HTML envelope preview
   */
  public static renderHtml(draft: GeneratedEmailDraft, recipientEmail: string): string {
    const formattedParagraphs = draft.fullBodyText
      .split("\n\n")
      .map((p) => `<p style="margin-bottom: 14px; line-height: 1.6; color: #334155;">${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${draft.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px; font-size: 13px; color: #64748b;">
      <div><strong>To:</strong> ${recipientEmail}</div>
      <div><strong>From:</strong> BrightLoop Technology &lt;outreach@brightloop.ai&gt;</div>
      <div style="margin-top: 6px; font-size: 15px; font-weight: 600; color: #0f172a;">${draft.subject}</div>
    </div>
    <div style="font-size: 14px;">
      ${formattedParagraphs}
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
