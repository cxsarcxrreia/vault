const LOCAL_APP_URL = "http://localhost:3000";
const DEFAULT_POST_LOGIN_PATH = "/portal";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeRelativePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return path;
}

export function getCanonicalAppUrl() {
  return getConfiguredAppUrl();
}

export function getConfiguredAppUrl() {
  const configured =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    LOCAL_APP_URL;

  if (!configured || !isHttpUrl(configured)) {
    return LOCAL_APP_URL;
  }

  return trimTrailingSlash(configured);
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function isLocalAppUrl(appUrl = getCanonicalAppUrl()) {
  try {
    const { hostname } = new URL(appUrl);
    return isLocalHost(hostname);
  } catch {
    return true;
  }
}

export function buildAuthCallbackUrl(next = DEFAULT_POST_LOGIN_PATH) {
  const callbackUrl = new URL("/api/auth/callback", getCanonicalAppUrl());
  const normalizedNext = normalizeRelativePath(next);

  if (normalizedNext !== DEFAULT_POST_LOGIN_PATH) {
    callbackUrl.searchParams.set("next", normalizedNext);
  }

  return callbackUrl.toString();
}

export function buildAgencyRegistrationCallbackUrl() {
  return new URL("/api/auth/register-callback", getCanonicalAppUrl()).toString();
}

export async function buildRequestAgencyRegistrationCallbackUrl() {
  return buildAgencyRegistrationCallbackUrl();
}

export function buildSignInCallbackUrl(next = DEFAULT_POST_LOGIN_PATH) {
  const normalizedNext = normalizeRelativePath(next);

  if (normalizedNext.startsWith("/admin") && !normalizedNext.startsWith("/admin/bootstrap")) {
    return new URL("/api/auth/admin-callback", getCanonicalAppUrl()).toString();
  }

  if (normalizedNext.startsWith("/portal")) {
    return new URL("/api/auth/portal-callback", getCanonicalAppUrl()).toString();
  }

  return buildAuthCallbackUrl(normalizedNext);
}

export async function buildRequestSignInCallbackUrl(next = DEFAULT_POST_LOGIN_PATH) {
  return buildSignInCallbackUrl(next);
}
