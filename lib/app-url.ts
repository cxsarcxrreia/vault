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
  return getConfiguredAppUrl() ?? LOCAL_APP_URL;
}

function getConfiguredAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured || !isHttpUrl(configured)) {
    return null;
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

function getFirstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function getProtocolFromRequest(host: string, forwardedProtocol: string | null) {
  const protocol = getFirstHeaderValue(forwardedProtocol);

  if (protocol === "http" || protocol === "https") {
    return protocol;
  }

  return host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
}

function getOriginFromHeader(value: string | null) {
  const headerValue = getFirstHeaderValue(value);

  if (!headerValue) {
    return null;
  }

  try {
    const url = new URL(headerValue);
    return trimTrailingSlash(url.origin);
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string) {
  const hostname = getUrlHostname(origin);

  return Boolean(hostname && isLocalHost(hostname));
}

function isTrustedRequestOrigin(origin: string) {
  let requestUrl: URL;

  try {
    requestUrl = new URL(origin);
  } catch {
    return false;
  }

  if (isLocalHost(requestUrl.hostname)) {
    return true;
  }

  const configured = getConfiguredAppUrl();

  if (!configured) {
    return requestUrl.protocol === "https:";
  }

  const configuredHostname = getUrlHostname(configured);

  if (configuredHostname && requestUrl.hostname === configuredHostname) {
    return true;
  }

  if (configuredHostname && isLocalHost(configuredHostname) && requestUrl.protocol === "https:") {
    return true;
  }

  return false;
}

export async function getRequestAppUrl() {
  const requestHeaders = await headers();
  const forwardedHost = getFirstHeaderValue(requestHeaders.get("x-forwarded-host"));
  const host = getFirstHeaderValue(requestHeaders.get("host"));
  const forwardedOrigin = forwardedHost
    ? getOriginFromHost(forwardedHost, getProtocolFromRequest(forwardedHost, requestHeaders.get("x-forwarded-proto")))
    : null;
  const originHeader = getOriginFromHeader(requestHeaders.get("origin"));
  const refererOrigin = getOriginFromHeader(requestHeaders.get("referer"));
  const hostOrigin = host ? getOriginFromHost(host, getProtocolFromRequest(host, requestHeaders.get("x-forwarded-proto"))) : null;
  const trustedOrigins = [forwardedOrigin, originHeader, refererOrigin, hostOrigin].filter(
    (origin): origin is string => Boolean(origin && isTrustedRequestOrigin(origin))
  );
  const requestOrigin = trustedOrigins.find((origin) => !isLocalOrigin(origin)) ?? trustedOrigins[0];

  if (!requestOrigin) {
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
