export type ArticleFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags?: string[];
  draft?: boolean;
};

export type ArticleMeta = ArticleFrontmatter & {
  slug: string;
};

export type Article = {
  meta: ArticleMeta;
  html: string;
};
