import { z } from "zod";

export const GeneratedEmailOutputSchema = z.object({
  subject: z
    .string()
    .min(10, "Subject line is too short")
    .max(120, "Subject line exceeds recommended 120 character limit"),
  opening: z.string().min(15, "Opening paragraph is required"),
  observation: z.string().min(20, "Verified technical observation is required"),
  opportunity: z.string().min(20, "Improvement opportunity explanation is required"),
  servicePitch: z.string().min(20, "BrightLoop service pitch is required"),
  closing: z.string().min(10, "Call to action closing is required"),
  signature: z.string().min(10, "Sender signature is required"),
  unsubscribeNotice: z.string().min(15, "Compliance unsubscribe notice is required"),
  evidenceCitations: z.array(z.string()).default([])
});

export type GeneratedEmailOutput = z.infer<typeof GeneratedEmailOutputSchema>;
