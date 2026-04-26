import { headers } from "next/headers";

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
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured || !isHttpUrl(configured)) {
    return LOCAL_APP_URL;
  }

  return trimTrailingSlash(configured);
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function getUrlHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

function getOriginFromHost(host: string, protocol: string) {
  return trimTrailingSlash(`${protocol}://${host}`);
}

function isTrustedRequestOrigin(origin: string) {
  const requestHostname = getUrlHostname(origin);
  const configuredHostname = getUrlHostname(getCanonicalAppUrl());

  if (!requestHostname) {
    return false;
  }

  if (isLocalHost(requestHostname)) {
    return true;
  }

  return Boolean(configuredHostname && requestHostname === configuredHostname);
}

export async function getRequestAppUrl() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");

  if (!host) {
    return getCanonicalAppUrl();
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  const requestOrigin = getOriginFromHost(host, protocol);

  if (!isTrustedRequestOrigin(requestOrigin)) {
    return getCanonicalAppUrl();
  }

  return requestOrigin;
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
  return new URL("/api/auth/register-callback", await getRequestAppUrl()).toString();
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
  const appUrl = await getRequestAppUrl();
  const normalizedNext = normalizeRelativePath(next);

  if (normalizedNext.startsWith("/admin") && !normalizedNext.startsWith("/admin/bootstrap")) {
    return new URL("/api/auth/admin-callback", appUrl).toString();
  }

  if (normalizedNext.startsWith("/portal")) {
    return new URL("/api/auth/portal-callback", appUrl).toString();
  }

  const callbackUrl = new URL("/api/auth/callback", appUrl);

  if (normalizedNext !== DEFAULT_POST_LOGIN_PATH) {
    callbackUrl.searchParams.set("next", normalizedNext);
  }

  return callbackUrl.toString();
}
