import { promises as fs } from "node:fs";
import path from "node:path";
import { getFrontmatter } from "next-mdx-remote-client/utils";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

type ArticleFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags?: string[];
  draft?: boolean;
};

type GeneratedArticle = {
  meta: ArticleFrontmatter & { slug: string };
  html: string;
};

const ROOT = process.cwd();
const ARTICLES_DIR = path.join(ROOT, "content/articles");
const OUTPUT_FILE = path.join(ROOT, "src/generated/articles.generated.ts");

function isValidFrontmatter(value: unknown): value is ArticleFrontmatter {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;

  return (
    typeof data.title === "string" &&
    typeof data.description === "string" &&
    typeof data.publishedAt === "string" &&
    typeof data.category === "string" &&
    (data.updatedAt === undefined || typeof data.updatedAt === "string") &&
    (data.draft === undefined || typeof data.draft === "boolean") &&
    (data.tags === undefined ||
      (Array.isArray(data.tags) &&
        data.tags.every((tag) => typeof tag === "string")))
  );
}

function replaceArticleAssetSlug(markdown: string, slug: string) {
  return markdown.replaceAll("/articles/<slug>/", `/articles/${slug}/`);
}

async function renderMarkdownToHtml(markdown: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

async function main() {
  const files = await fs.readdir(ARTICLES_DIR);

  const articles: GeneratedArticle[] = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const slug = file.replace(/\.mdx$/, "");
        const fullPath = path.join(ARTICLES_DIR, file);
        const source = await fs.readFile(fullPath, "utf8");
        const { frontmatter, strippedSource } =
          getFrontmatter<ArticleFrontmatter>(source);

        if (!isValidFrontmatter(frontmatter)) {
          throw new Error(`Invalid frontmatter: ${file}`);
        }

        const normalizedMarkdown = replaceArticleAssetSlug(
          strippedSource,
          slug
        );
        const html = await renderMarkdownToHtml(normalizedMarkdown);

        return {
          meta: {
            slug,
            ...frontmatter,
          },
          html,
        };
      })
  );

  articles.sort(
    (a, b) =>
      new Date(b.meta.publishedAt).getTime() -
      new Date(a.meta.publishedAt).getTime()
  );

  const output = `import type { Article } from "@/types/Article";

export const ARTICLES: Article[] = ${JSON.stringify(
    articles,
    null,
    2
  )} as Article[];
`;

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, output, "utf8");

  console.log(`Generated ${articles.length} articles.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
