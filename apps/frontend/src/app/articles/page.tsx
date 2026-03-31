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
    <StaticPageLayout maxWidth="5xl">
      <StaticPageHead>
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-strong">記事一覧</h1>
          <p className="text-sm text-muted">
            雨天中止予測の見方や観戦準備に役立つ記事をまとめています。
          </p>
        </header>
      </StaticPageHead>

      <section className="grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </section>
    </StaticPageLayout>
  );
}
