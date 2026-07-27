"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CountryOption } from "@/lib/countries";
import type { LinkStats } from "@/lib/types";

type CountryGroup = {
  id: string;
  label: string;
  countries: string[];
};

type DashboardProps = {
  countryOptions: CountryOption[];
  countryGroups: CountryGroup[];
};

export function Dashboard({ countryOptions, countryGroups }: DashboardProps) {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["IN"]);
  const [stats, setStats] = useState<LinkStats[]>([]);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  async function refreshStats() {
    const response = await fetch("/api/stats", { cache: "no-store" });
    const payload = (await response.json()) as { stats: LinkStats[] };
    setStats(payload.stats);
  }

  useEffect(() => {
    void refreshStats();
  }, []);

  const selectedLabel = useMemo(() => {
    if (selectedCountries.length === 0) {
      return "尚未选择国家或地区";
    }

    if (selectedCountries.length === 1) {
      return countryOptions.find(
        (country) => country.code === selectedCountries[0],
      )?.name;
    }

    return `已选择 ${selectedCountries.length} 个国家或地区`;
  }, [countryOptions, selectedCountries]);

  function toggleCountry(code: string) {
    setSelectedCountries((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  }

  function applyGroup(countries: string[]) {
    setSelectedCountries(Array.from(new Set(countries)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    const response = await fetch("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        targetUrl,
        allowedCountries: selectedCountries,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error ?? "创建短链失败。");
      setIsSubmitting(false);
      return;
    }

    setName("");
    setTargetUrl("");
    setStatus(`已创建 /r/${payload.link.slug}`);
    setIsSubmitting(false);
    await refreshStats();
  }

  const totals = stats.reduce(
    (acc, item) => {
      acc.links += 1;
      acc.total += item.totalVisits;
      acc.allowed += item.allowedVisits;
      acc.fallback += item.fallbackVisits;
      return acc;
    },
    { links: 0, total: 0, allowed: 0, fallback: 0 },
  );

  return (
    <main className="app-shell">
      <section className="hero-band">
        {/* <div>
          <p className="eyebrow">地域分流短链</p>
          <h5>按国家分配推广流量，并记录每一次跳转决策。</h5>
        </div> */}
        <div className="hero-meter" aria-label="推广分流概览">
          <span>{totals.allowed}</span>
          <small>允许跳转</small>
        </div>
      </section>

      <section className="summary-grid" aria-label="平台概览">
        <Metric label="短链数" value={totals.links} />
        <Metric label="访问量" value={totals.total} />
        <Metric label="放行" value={totals.allowed} />
        <Metric label="备用页" value={totals.fallback} />
      </section>

      <div className="workspace-grid">
        <section className="panel create-panel">
          <div className="panel-heading">
            <p className="eyebrow">创建</p>
            <h2>新的推广短链</h2>
          </div>

          <form onSubmit={handleSubmit} className="link-form">
            <label>
              推广名称
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="夏季获客测试"
              />
            </label>

            <label>
              目标网址
              <input
                required
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
                placeholder="https://example.com/campaign"
                inputMode="url"
              />
            </label>

            <div className="country-header">
              <div>
                <span>允许访问的国家或地区</span>
                <strong>{selectedLabel}</strong>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setSelectedCountries([])}
              >
                清空
              </button>
            </div>

            <div className="group-row">
              {countryGroups.map((group) => (
                <button
                  type="button"
                  key={group.id}
                  className="chip-button"
                  onClick={() => applyGroup(group.countries)}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="country-grid">
              {countryOptions.map((country) => (
                <button
                  type="button"
                  key={country.code}
                  className={
                    selectedCountries.includes(country.code)
                      ? "country selected"
                      : "country"
                  }
                  onClick={() => toggleCountry(country.code)}
                  aria-pressed={selectedCountries.includes(country.code)}
                >
                  <span>{country.code}</span>
                  {country.name}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "创建中..." : "创建地域短链"}
            </button>
            {status ? <p className="status-line">{status}</p> : null}
          </form>
        </section>

        <section className="panel stats-panel">
          <div className="panel-heading inline">
            <div>
              <p className="eyebrow">监控</p>
              <h2>推广统计</h2>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => void refreshStats()}
            >
              刷新
            </button>
          </div>

          <div className="link-list">
            {stats.map((item) => (
              <article key={item.link.id} className="link-row">
                <div className="link-main">
                  <div>
                    <h3>{item.link.name}</h3>
                    <a
                      href={`/r/${item.link.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {origin}/r/{item.link.slug}
                    </a>
                  </div>
                  <span className="country-pill">
                    {item.link.allowedCountries.join(", ")}
                  </span>
                </div>

                <div className="mini-metrics">
                  <Metric label="访问量" value={item.totalVisits} compact />
                  <Metric label="放行" value={item.allowedVisits} compact />
                  <Metric label="备用页" value={item.fallbackVisits} compact />
                </div>

                <div className="country-breakdown">
                  {item.countries.length === 0 ? (
                    <span>暂无访问</span>
                  ) : (
                    item.countries.slice(0, 5).map((country) => (
                      <span key={country.countryCode}>
                        {country.countryCode}: {country.total}
                      </span>
                    ))
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "metric compact" : "metric"}>
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}
