export type LinkStatus = "active" | "disabled";

export type VisitDecision = "allowed" | "fallback";

export type CampaignLink = {
  id: string;
  slug: string;
  name: string;
  targetUrl: string;
  allowedCountries: string[];
  status: LinkStatus;
  createdAt: string;
  expiresAt: string | null;
};

export type VisitEvent = {
  id: string;
  linkId: string;
  slug: string;
  countryCode: string;
  decision: VisitDecision;
  ipHash: string;
  userAgent: string;
  referer: string;
  createdAt: string;
};

export type DatabaseShape = {
  links: CampaignLink[];
  visits: VisitEvent[];
};

export type LinkStats = {
  link: CampaignLink;
  totalVisits: number;
  allowedVisits: number;
  fallbackVisits: number;
  countries: Array<{
    countryCode: string;
    total: number;
    allowed: number;
    fallback: number;
  }>;
  recentVisits: VisitEvent[];
};
