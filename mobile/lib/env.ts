/**
 * Validate that all required environment variables are set at app startup.
 * Call once at the module root of the entry point so the check runs
 * synchronously before any code that depends on these values.
 *
 * This avoids obscure runtime crashes (e.g. createClient(undefined, …))
 * when a developer forgets to configure their .env file.
 */

const REQUIRED_VARS = [
  ["EXPO_PUBLIC_SUPABASE_URL", "Supabase project URL"],
  ["EXPO_PUBLIC_SUPABASE_ANON_KEY", "Supabase anonymous key"],
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const [key] of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const msg = [
      `Missing required environment variable(s): ${missing.join(", ")}.`,
      "",
      "Create or update your mobile/.env file with the following values:",
      "",
      ...REQUIRED_VARS.map(
        ([key, desc]) => `  ${key}=${desc.includes("URL") ? "https://your-project.supabase.co" : "<your-value>"}`,
      ),
      "",
      "See mobile/.env.example for a template.",
    ].join("\n");

    throw new Error(msg);
  }
}
