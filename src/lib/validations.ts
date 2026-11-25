import { z } from "zod";

export const CreateLeadSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  domain: z.string().min(3, "Valid domain is required"),
  website_url: z.string().url("Must be a valid URL"),
  country: z.string().default("United States"),
  industry: z.string().default("General B2B"),
  business_type: z.string().default("Mid-Market B2B"),
  status: z.enum(["New", "Audited", "Contacted", "Interested", "Replied", "Disqualified"]).default("New"),
  notes: z.string().optional().nullable(),
  contact: z.object({
    first_name: z.string().min(1, "First name required"),
    last_name: z.string().min(1, "Last name required"),
    email: z.string().email("Valid email required"),
    phone: z.string().optional().nullable(),
    job_title: z.string().default("Decision Maker"),
    linkedin_url: z.string().optional().nullable()
  }).optional()
});

export const UpdateLeadSchema = z.object({
  name: z.string().min(2).optional(),
  domain: z.string().min(3).optional(),
  website_url: z.string().url().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  business_type: z.string().optional(),
  status: z.enum(["New", "Audited", "Contacted", "Interested", "Replied", "Disqualified"]).optional(),
  notes: z.string().optional().nullable()
});

export const CreateServiceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(5, "Description is required"),
  typical_price_tier: z.string().optional().nullable(),
  is_active: z.boolean().default(true)
});
