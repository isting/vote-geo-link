import type { NextRequest } from "next/server";

function cleanBaseUrl(value: string) {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}

export function getRequestOrigin(request: NextRequest) {
  const configuredOrigin =
    cleanBaseUrl(process.env.APP_BASE_URL ?? "") ??
    cleanBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "");

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost || firstHeaderValue(request.headers.get("host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const protocol = forwardedProto || request.nextUrl.protocol.replace(":", "") || "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  return request.nextUrl.origin;
}

export function createSiteUrl(request: NextRequest, path: string) {
  return new URL(path, getRequestOrigin(request));
}
