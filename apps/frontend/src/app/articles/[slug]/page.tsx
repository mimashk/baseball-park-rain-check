import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { getAllArticleSlugs, getArticleBySlug } from "@/lib/content/articles";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return {};

  return {
    title: `${article.meta.title} | プロ野球 雨天中止予報`,
    description: article.meta.description,
    alternates: {
      canonical: `/articles/${article.meta.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.meta.draft) {
    notFound();
  }

  return (
    <ArticleLayout meta={article.meta}>
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />
    </ArticleLayout>
  );
}
