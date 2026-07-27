const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal"]);

function isPrivateIPv4(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

export function parseSafePublicUrl(value: string) {
  let parsed: URL;

  try {
    parsed = new URL(value.trim());
  } catch {
    return { ok: false as const, error: "请输入有效的网址。" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false as const, error: "只允许 HTTP 或 HTTPS 网址。" };
  }

  if (value.length > 2048) {
    return { ok: false as const, error: "网址过长。" };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTS.has(hostname) || isPrivateIPv4(hostname)) {
    return { ok: false as const, error: "不允许填写内网或本地网络地址。" };
  }

  return { ok: true as const, url: parsed.toString() };
}
