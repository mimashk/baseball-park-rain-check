import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/ui/StaticPageLayout";
import { StaticPageHead } from "@/components/ui/StaticPageHead";
import { ArticleCard } from "@/components/article/ArticleCard";
import { getArticleMetaList } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "記事一覧 | プロ野球 雨天中止予報",
  description: "プロ野球の雨天中止予測や球場・観戦準備に関する記事一覧です。",
  alternates: {
    canonical: "/articles",
  },
};

export default async function ArticlesPage() {
  const articles = await getArticleMetaList();

  return (
    <StaticPageLayout maxWidth="5xl" className="gap-8">
      <StaticPageHead>
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-strong">
              記事一覧
            </h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              全{articles.length}件
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            雨天中止予測の見方、球場ごとの傾向、雨の日の観戦準備などをわかりやすくまとめています。
          </p>
        </header>
      </StaticPageHead>

      <section className="grid gap-5 md:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </StaticPageLayout>
  );
}
