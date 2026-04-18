import Link from "next/link";
import type { ReactNode } from "react";
import { StaticPageLayout } from "@/components/ui/StaticPageLayout";
import { StaticPageHead } from "@/components/ui/StaticPageHead";
import { SectionCard } from "@/components/ui/SectionCard";
import type { ArticleMeta } from "@/types/Article";

type Props = {
  meta: ArticleMeta;
  children: ReactNode;
};

function ArticlesLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/articles"
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900 ${className}`.trim()}
    >
      <span aria-hidden="true">←</span>
      記事一覧へ戻る
    </Link>
  );
}

export function ArticleLayout({ meta, children }: Props) {
  return (
    <StaticPageLayout maxWidth="5xl" className="gap-8">
      <StaticPageHead>
        <div className="space-y-4">
          <ArticlesLink />

          <header className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-indigo-50 px-6 py-8 shadow-sm md:px-8 md:py-10">
            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">
                  {meta.category}
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                  公開日: {meta.publishedAt}
                </span>
                {meta.updatedAt ? (
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    更新日: {meta.updatedAt}
                  </span>
                ) : null}
              </div>

              <div className="space-y-3">
                <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  {meta.title}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  {meta.description}
                </p>
              </div>

              {meta.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-indigo-200/25 blur-3xl" />
          </header>
        </div>
      </StaticPageHead>

      <SectionCard className="border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">
        <article className="mx-auto max-w-3xl">
          {children}

          <div className="mt-12 border-t border-slate-200 pt-8">
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50 px-5 py-5 ring-1 ring-slate-200 md:px-6">
              <p className="text-base font-semibold text-slate-900">
                他の記事もあわせて読む
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                雨天中止の見方や、雨の日の観戦準備、球場ごとの特徴をまとめた記事を一覧で読めます。
              </p>
              <ArticlesLink className="mt-4" />
            </div>
          </div>
        </article>
      </SectionCard>
    </StaticPageLayout>
  );
}
