import { z } from "zod";

const serverEnvSchema = z.object({
  // Public
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(10, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").default("http://localhost:3000"),

  // Server-only Secrets
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, "SUPABASE_SERVICE_ROLE_KEY is required for server administrative operations"),
  TOKEN_ENCRYPTION_SECRET: z.string().min(32, "TOKEN_ENCRYPTION_SECRET must be at least 32 characters for AES-256-GCM").default("brightloop-default-super-secret-key-32b"),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  SEARCH_API_KEY: z.string().optional(),
  WEBHOOK_SIGNING_SECRET: z.string().default("brightloop-hmac-sha256-webhook-signing-secret"),

  // Queue & Worker
  REDIS_URL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000)
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates environment variables at application startup or worker initialization.
 * Throws clean, actionable errors without leaking secret contents.
 */
export function validateEnv(): { valid: boolean; errors: string[]; env?: ServerEnv } {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const errorMessages = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    return { valid: false, errors: errorMessages };
  }
  return { valid: true, errors: [], env: result.data };
}

/**
 * Strict server assertion that halts execution if required production variables are absent.
 */
export function assertProductionEnv(): ServerEnv {
  const { valid, errors, env } = validateEnv();
  if (!valid) {
    console.error("[CRITICAL] Production Environment Variable Validation Failed:\n" + errors.map(e => `  - ${e}`).join("\n"));
    throw new Error(`Environment validation failed with ${errors.length} error(s). Check server startup logs.`);
  }
  return env!;
}
