import type { NextRequest } from "next/server";

const PRIVATE_IP =
  /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|::1|fc|fd|fe80)/i;

/** Short-lived cache so the same visitor IP is not looked up on every click. */
const countryCache = new Map<string, { country: string; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    request.headers.get("cf-connecting-ip") ??
    firstForwardedIp ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isPrivateOrUnknown(ip: string) {
  return ip === "unknown" || PRIVATE_IP.test(ip);
}

async function lookupCountryByIp(ip: string): Promise<string> {
  const cached = countryCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.country;
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(3000)
    });
    const data = (await response.json()) as {
      success?: boolean;
      country_code?: string;
    };

    const country =
      data.success && data.country_code && /^[A-Z]{2}$/i.test(data.country_code)
        ? data.country_code.toUpperCase()
        : "ZZ";

    countryCache.set(ip, { country, expiresAt: Date.now() + CACHE_TTL_MS });
    return country;
  } catch {
    return "ZZ";
  }
}

/** Resolve visitor country from their public exit IP (VPN exit IP counts). */
export async function getCountryFromRequest(request: NextRequest) {
  const ip = getClientIp(request);

  if (isPrivateOrUnknown(ip)) {
    return "ZZ";
  }

  return lookupCountryByIp(ip);
}
