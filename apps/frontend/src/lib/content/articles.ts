import { ARTICLES } from "@/generated/articles.generated";
import type { Article, ArticleMeta } from "@/types/Article";

function sortByPublishedAtDesc(a: ArticleMeta, b: ArticleMeta) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export async function getAllArticleSlugs(): Promise<string[]> {
  return ARTICLES.filter((article) => !article.meta.draft).map(
    (article) => article.meta.slug
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const article = ARTICLES.find((entry) => entry.meta.slug === slug);
  return article ?? null;
}

export async function getArticleMetaList(): Promise<ArticleMeta[]> {
  return ARTICLES.filter((article) => !article.meta.draft)
    .map((article) => article.meta)
    .sort(sortByPublishedAtDesc);
}
