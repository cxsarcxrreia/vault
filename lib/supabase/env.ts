const placeholderValues = new Set([
  "",
  "replace-with-local-anon-key",
  "replace-with-local-service-role-key",
  "your-supabase-anon-key",
  "your-supabase-service-role-key",
  "https://your-project-ref.supabase.co",
  "your-project-ref"
]);

function isConfigured(value: string | undefined) {
  return Boolean(value && !placeholderValues.has(value));
}

function assertValidUrl(value: string, key: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error(`${key} must be a valid http(s) URL.`);
  }
}

function assertJwtLike(value: string, key: string) {
  if (value.split(".").length !== 3) {
    throw new Error(`${key} must look like a Supabase JWT key.`);
  }
}

export function hasSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return isConfigured(url) && isConfigured(anonKey);
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isConfigured(url)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing or still set to a placeholder.");
  }

  if (!isConfigured(anonKey)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or still set to a placeholder.");
  }

  const validUrl = url as string;
  const validAnonKey = anonKey as string;

  assertValidUrl(validUrl, "NEXT_PUBLIC_SUPABASE_URL");
  assertJwtLike(validAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return { url: validUrl, anonKey: validAnonKey };
}

export function getSupabaseServiceRoleEnv() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isConfigured(serviceRoleKey)) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing or still set to a placeholder.");
  }

  const validServiceRoleKey = serviceRoleKey as string;
  assertJwtLike(validServiceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");

  return { url, serviceRoleKey: validServiceRoleKey };
}

export function getSupabaseProjectRef() {
  const configuredRef = process.env.SUPABASE_PROJECT_REF;

  if (isConfigured(configuredRef)) {
    return configuredRef;
  }

  if (!hasSupabaseEnv()) {
    return null;
  }

  const { url } = getSupabaseEnv();
  return new URL(url).host.split(".")[0] ?? null;
}
