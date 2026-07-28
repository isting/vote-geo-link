import Link from "next/link";

export default function UnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  return (
    <main className="fallback-shell">
      <section className="fallback-panel">
        <p className="eyebrow">地区不可用</p>
        <h4>该内容暂不适用于你所在的地区。</h4>
        {/* <p>
          链接本身仍然有效，但创建者只允许特定国家或地区的访问者进入目标页面。
        </p> */}
        {/* <Link href="/" className="text-link">
          创建一个自己的地域分流短链
        </Link> */}
      </section>
    </main>
  );
}
