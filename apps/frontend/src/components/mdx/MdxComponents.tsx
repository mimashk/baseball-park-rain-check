import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { Callout } from "./Callout";

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      {...props}
      className="mt-10 text-xl font-bold tracking-tight text-strong"
    />
  ),
  h3: (props) => (
    <h3 {...props} className="mt-8 text-lg font-semibold text-strong" />
  ),
  p: (props) => (
    <p {...props} className="mt-4 text-[15px] leading-8 text-slate-700" />
  ),
  ul: (props) => (
    <ul {...props} className="mt-4 list-disc space-y-2 pl-6 text-slate-700" />
  ),
  ol: (props) => (
    <ol
      {...props}
      className="mt-4 list-decimal space-y-2 pl-6 text-slate-700"
    />
  ),
  li: (props) => <li {...props} className="leading-8" />,
  a: (props) => (
    <a
      {...props}
      className="underline underline-offset-2 hover:text-strong"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="mt-6 border-l-4 border-slate-300 pl-4 text-slate-600"
    />
  ),
  Callout,
};
