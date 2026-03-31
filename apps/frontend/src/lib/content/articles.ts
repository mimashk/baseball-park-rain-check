import { promises as fs } from "node:fs";
import path from "node:path";
import { getFrontmatter } from "next-mdx-remote-client/utils";
import type { Article, ArticleFrontmatter, ArticleMeta } from "@/types/Article";

const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

function isValidFrontmatter(value: unknown): value is ArticleFrontmatter {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;

  return (
    typeof data.title === "string" &&
    typeof data.description === "string" &&
    typeof data.publishedAt === "string" &&
    (data.updatedAt === undefined || typeof data.updatedAt === "string") &&
    (data.draft === undefined || typeof data.draft === "boolean") &&
    (data.tags === undefined ||
      (Array.isArray(data.tags) &&
        data.tags.every((tag) => typeof tag === "string")))
  );
}

async function readArticleSource(slug: string) {
  const fullPath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  return fs.readFile(fullPath, "utf8");
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const files = await fs.readdir(ARTICLES_DIR);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const source = await readArticleSource(slug);
    const { frontmatter, strippedSource } =
      getFrontmatter<ArticleFrontmatter>(source);

    if (!isValidFrontmatter(frontmatter)) {
      throw new Error(`Invalid frontmatter: ${slug}`);
    }

    return {
      meta: {
        slug,
        ...frontmatter,
      },
      body: strippedSource,
    };
  } catch {
    return null;
  }
}

export async function getArticleMetaList(): Promise<ArticleMeta[]> {
  const slugs = await getAllArticleSlugs();
  const articles = await Promise.all(
    slugs.map((slug) => getArticleBySlug(slug))
  );

  return articles
    .filter((article): article is Article => article !== null)
    .filter((article) => !article.meta.draft)
    .map((article) => article.meta)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}
