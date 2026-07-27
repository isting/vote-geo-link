import type { NextRequest } from "next/server";

const COUNTRY_HEADER_PRIORITY = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "x-geo-test-country"
];

export function getCountryFromRequest(request: NextRequest) {
  for (const header of COUNTRY_HEADER_PRIORITY) {
    const value = request.headers.get(header)?.trim().toUpperCase();

    if (value && /^[A-Z]{2}$/.test(value) && value !== "XX") {
      return value;
    }
  }

  return "ZZ";
}

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
