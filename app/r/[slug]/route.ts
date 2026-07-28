import { NextRequest, NextResponse } from "next/server";
import { getClientIp, getCountryFromRequest } from "@/lib/geo";
import { getLinkBySlug, recordVisit } from "@/lib/db";
import { createSiteUrl } from "@/lib/site-url";

const FALLBACK_PATH = "/unavailable";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const link = await getLinkBySlug(slug);
  const fallbackUrl = createSiteUrl(
    request,
    `${FALLBACK_PATH}?ref=${encodeURIComponent(slug)}`,
  );

  if (!link || link.status !== "active") {
    return NextResponse.redirect(fallbackUrl, 302);
  }

  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    return NextResponse.redirect(fallbackUrl, 302);
  }

  const ip = getClientIp(request);
  const countryCode = await getCountryFromRequest(request);
  const decision = link.allowedCountries.includes(countryCode) ? "allowed" : "fallback";

  await recordVisit({
    link,
    countryCode,
    decision,
    ip,
    userAgent: request.headers.get("user-agent") ?? "",
    referer: request.headers.get("referer") ?? ""
  });

  if (decision === "allowed") {
    return NextResponse.redirect(link.targetUrl, 302);
  }

  return NextResponse.redirect(fallbackUrl, 302);
}
