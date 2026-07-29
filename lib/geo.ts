import type { NextRequest } from "next/server";

const COUNTRY_HEADER_PRIORITY = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "cloudfront-viewer-country",
  "fastly-client-country",
];

const PRIVATE_IP =
  /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|::1|fc|fd|fe80)/i;

/** Short-lived cache so the same visitor IP is not looked up on every click. */
const countryCache = new Map<string, { country: string; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0];

  return normalizeIp(
    request.headers.get("cf-connecting-ip") ??
    firstForwardedIp ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function normalizeIp(value: string) {
  let ip = value.trim().replace(/^"|"$/g, "");

  // Proxies may format addresses as "[IPv6]:port" or IPv4:port.
  const bracketedIpv6 = ip.match(/^\[([^\]]+)](?::\d+)?$/);
  if (bracketedIpv6) {
    ip = bracketedIpv6[1];
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.slice(0, ip.lastIndexOf(":"));
  }

  return ip.replace(/^::ffff:/i, "") || "unknown";
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

    if (!response.ok) {
      return "ZZ";
    }

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
  for (const header of COUNTRY_HEADER_PRIORITY) {
    const country = request.headers.get(header)?.trim().toUpperCase();

    if (country && /^[A-Z]{2}$/.test(country) && country !== "XX") {
      return country;
    }
  }

  const ip = getClientIp(request);

  if (isPrivateOrUnknown(ip)) {
    return "ZZ";
  }

  return lookupCountryByIp(ip);
}
