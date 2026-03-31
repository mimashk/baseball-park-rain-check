import type { ReactNode } from "react";
import { StaticPageLayout } from "@/components/ui/StaticPageLayout";
import { StaticPageHead } from "@/components/ui/StaticPageHead";
import { SectionCard } from "@/components/ui/SectionCard";
import type { ArticleMeta } from "@/types/Article";

type Props = {
  meta: ArticleMeta;
  children: ReactNode;
};

export function ArticleLayout({ meta, children }: Props) {
  return (
    <StaticPageLayout maxWidth="5xl">
      <StaticPageHead>
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted">読みもの</p>
          <h1 className="text-3xl font-bold tracking-tight text-strong">
            {meta.title}
          </h1>
          <p className="text-sm leading-7 text-muted">{meta.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span>公開日: {meta.publishedAt}</span>
            {meta.updatedAt ? <span>更新日: {meta.updatedAt}</span> : null}
          </div>
        </header>
      </StaticPageHead>

      <SectionCard className="px-6 py-8 md:px-10">
        <article>{children}</article>
      </SectionCard>
    </StaticPageLayout>
  );
}
