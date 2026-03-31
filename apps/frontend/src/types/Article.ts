export type ArticleFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
  draft?: boolean;
};

export type ArticleMeta = ArticleFrontmatter & {
  slug: string;
};

export type Article = {
  meta: ArticleMeta;
  body: string;
};
