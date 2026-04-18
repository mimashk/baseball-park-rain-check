import Link from "next/link";
import type { ArticleMeta } from "@/types/Article";

type Props = {
  article: ArticleMeta;
};

export function ArticleCard({ article }: Props) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group relative block overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-800">
            {article.category}
          </span>
          <span className="text-slate-500">{article.publishedAt}</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold leading-8 text-slate-900 transition group-hover:text-sky-800">
            {article.title}
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            {article.description}
          </p>
        </div>

        {article.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto pt-2 text-sm font-medium text-sky-700">
          続きを読む
          <span className="ml-1 inline-block transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
