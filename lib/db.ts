import { createHash, randomBytes, randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { CampaignLink, DatabaseShape, LinkStats, VisitDecision, VisitEvent } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const DEMO_LINK: CampaignLink = {
  id: "demo-link",
  slug: "demo",
  name: "印度推广示例",
  targetUrl: "https://example.com/india-campaign",
  allowedCountries: ["IN"],
  status: "active",
  createdAt: new Date(0).toISOString(),
  expiresAt: null
};

async function ensureDb() {
  await mkdir(path.dirname(DB_PATH), { recursive: true });

  try {
    await readFile(DB_PATH, "utf8");
  } catch {
    await writeDb({ links: [DEMO_LINK], visits: [] });
  }
}

async function readDb(): Promise<DatabaseShape> {
  await ensureDb();
  const raw = await readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as DatabaseShape;
}

async function writeDb(db: DatabaseShape) {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

function createSlug() {
  return randomBytes(4).toString("base64url");
}

export async function listLinks() {
  const db = await readDb();
  return db.links.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLinkBySlug(slug: string) {
  const db = await readDb();
  return db.links.find((link) => link.slug === slug) ?? null;
}

export async function createCampaignLink(input: {
  name: string;
  targetUrl: string;
  allowedCountries: string[];
  expiresAt?: string | null;
}) {
  const db = await readDb();
  let slug = createSlug();

  while (db.links.some((link) => link.slug === slug)) {
    slug = createSlug();
  }

  const link: CampaignLink = {
    id: randomUUID(),
    slug,
    name: input.name.trim() || "未命名推广",
    targetUrl: input.targetUrl,
    allowedCountries: input.allowedCountries,
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresAt ?? null
  };

  db.links.push(link);
  await writeDb(db);
  return link;
}

export async function recordVisit(input: {
  link: CampaignLink;
  countryCode: string;
  decision: VisitDecision;
  ip: string;
  userAgent: string;
  referer: string;
}) {
  const db = await readDb();
  const visit: VisitEvent = {
    id: randomUUID(),
    linkId: input.link.id,
    slug: input.link.slug,
    countryCode: input.countryCode,
    decision: input.decision,
    ipHash: createHash("sha256").update(input.ip).digest("hex").slice(0, 20),
    userAgent: input.userAgent.slice(0, 300),
    referer: input.referer.slice(0, 300),
    createdAt: new Date().toISOString()
  };

  db.visits.push(visit);
  await writeDb(db);
  return visit;
}

export async function getStats(): Promise<LinkStats[]> {
  const db = await readDb();

  return db.links
    .map((link) => {
      const visits = db.visits.filter((visit) => visit.linkId === link.id);
      const countryMap = new Map<string, { total: number; allowed: number; fallback: number }>();

      for (const visit of visits) {
        const current = countryMap.get(visit.countryCode) ?? {
          total: 0,
          allowed: 0,
          fallback: 0
        };

        current.total += 1;
        current[visit.decision] += 1;
        countryMap.set(visit.countryCode, current);
      }

      return {
        link,
        totalVisits: visits.length,
        allowedVisits: visits.filter((visit) => visit.decision === "allowed").length,
        fallbackVisits: visits.filter((visit) => visit.decision === "fallback").length,
        countries: Array.from(countryMap.entries())
          .map(([countryCode, counts]) => ({ countryCode, ...counts }))
          .sort((a, b) => b.total - a.total),
        recentVisits: visits
          .slice()
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 8)
      };
    })
    .sort((a, b) => b.link.createdAt.localeCompare(a.link.createdAt));
}
