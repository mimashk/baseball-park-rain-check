import Link from "next/link";
import type { ArticleMeta } from "@/types/Article";

type Props = {
  article: ArticleMeta;
};

export function ArticleCard({ article }: Props) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-strong">{article.title}</h2>
        <p className="text-sm leading-7 text-muted">{article.description}</p>
        <p className="text-xs text-muted">{article.publishedAt}</p>
      </div>
    </Link>
  );
}
