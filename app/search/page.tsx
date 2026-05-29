import type { Metadata } from "next";
import { searchSite } from "./search-index";
import { SITE_NAME } from "../seo";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: `站内搜索 | ${SITE_NAME}`,
  description: "搜索静心修习空间内的佛经、佛教知识、修习工具与文章内容。",
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = firstParam(params.q).trim();
  const results = searchSite(query);

  return (
    <main className="search-page-shell">
      <section className="search-page-hero">
        <a href="/" className="search-page-home-link">
          静心修习空间
        </a>
        <h1>站内搜索</h1>
        <form action="/search" className="search-page-form">
          <span className="search-page-icon" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="输入心经、抄经、佛号、佛乐、菩萨..."
            aria-label="站内搜索关键词"
          />
          <button type="submit">搜索</button>
        </form>
      </section>

      <section className="search-results-panel" aria-live="polite">
        {query ? (
          <p className="search-results-count">
            “{query}” 找到 {results.length} 条站内结果
          </p>
        ) : (
          <p className="search-results-count">
            请输入关键词，例如“心经”“抄经”“阿弥陀佛”。
          </p>
        )}

        {query && results.length === 0 ? (
          <div className="search-empty-state">
            暂时没有找到匹配内容。可以换一个更短的关键词再试。
          </div>
        ) : null}

        <div className="search-results-list">
          {results.map((result) => (
            <a key={result.id} href={result.href} className="search-result-card">
              <span className="search-result-category">{result.category}</span>
              <h2>{result.title}</h2>
              <p>{result.excerpt}</p>
              <span className="search-result-action">查看详细内容</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
