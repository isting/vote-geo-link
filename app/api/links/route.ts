import { NextResponse } from "next/server";
import { COUNTRY_CODES } from "@/lib/countries";
import { createCampaignLink, listLinks } from "@/lib/db";
import { parseSafePublicUrl } from "@/lib/url-safety";

export async function GET() {
  return NextResponse.json({ links: await listLinks() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    targetUrl?: string;
    allowedCountries?: string[];
    expiresAt?: string | null;
  };

  const parsedUrl = parseSafePublicUrl(body.targetUrl ?? "");

  if (!parsedUrl.ok) {
    return NextResponse.json({ error: parsedUrl.error }, { status: 400 });
  }

  const allowedCountries = Array.from(
    new Set((body.allowedCountries ?? []).map((code) => code.toUpperCase()))
  ).filter((code) => COUNTRY_CODES.has(code));

  if (allowedCountries.length === 0) {
    return NextResponse.json({ error: "请至少选择一个允许访问的国家或地区。" }, { status: 400 });
  }

  const link = await createCampaignLink({
    name: body.name ?? "",
    targetUrl: parsedUrl.url,
    allowedCountries,
    expiresAt: body.expiresAt ?? null
  });

  return NextResponse.json({ link }, { status: 201 });
}
