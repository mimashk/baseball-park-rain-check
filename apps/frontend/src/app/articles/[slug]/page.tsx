import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { mdxComponents } from "@/components/mdx/MdxComponents";
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

function MdxError({ error }: { error: Error }) {
  return (
    <p className="text-sm text-red-600">
      記事の読み込みに失敗しました: {error.message}
    </p>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.meta.draft) {
    notFound();
  }

  return (
    <ArticleLayout meta={article.meta}>
      <MDXRemote
        source={article.body}
        components={mdxComponents}
        onError={MdxError}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </ArticleLayout>
  );
}
