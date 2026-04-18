import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "next-mdx-remote-client/rsc";
import { Callout } from "./Callout";

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      {...props}
      className={cx(
        "mt-12 scroll-mt-24 border-b border-slate-200 pb-3 text-2xl font-bold tracking-tight text-strong",
        props.className
      )}
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className={cx(
        "mt-8 text-xl font-semibold tracking-tight text-strong",
        props.className
      )}
    />
  ),
  h4: (props) => (
    <h4
      {...props}
      className={cx(
        "mt-6 text-base font-semibold text-strong",
        props.className
      )}
    />
  ),
  p: (props) => (
    <p
      {...props}
      className={cx(
        "mt-4 text-[15px] leading-8 text-slate-700 md:text-base",
        props.className
      )}
    />
  ),
  ul: (props) => (
    <ul
      {...props}
      className={cx(
        "mt-4 list-disc space-y-2 pl-6 text-[15px] leading-8 text-slate-700",
        props.className
      )}
    />
  ),
  ol: (props) => (
    <ol
      {...props}
      className={cx(
        "mt-4 list-decimal space-y-2 pl-6 text-[15px] leading-8 text-slate-700",
        props.className
      )}
    />
  ),
  li: (props) => <li {...props} className={cx("leading-8", props.className)} />,
  a: (props) => (
    <a
      {...props}
      className={cx(
        "font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-sky-900",
        props.className
      )}
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
    />
  ),
  strong: (props) => (
    <strong
      {...props}
      className={cx("font-semibold text-slate-900", props.className)}
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className={cx(
        "mt-6 rounded-r-2xl border-l-4 border-sky-300 bg-sky-50/70 px-5 py-4 text-slate-700",
        props.className
      )}
    />
  ),
  hr: (props) => (
    <hr
      {...props}
      className={cx(
        "my-10 border-0 border-t border-slate-200",
        props.className
      )}
    />
  ),
  img: (props: ComponentPropsWithoutRef<"img">) => (
    <img
      {...props}
      className={cx(
        "mt-6 w-full rounded-2xl border border-slate-200 bg-slate-100 object-cover shadow-sm",
        props.className
      )}
      loading="lazy"
    />
  ),
  table: (props) => (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table
        {...props}
        className={cx(
          "min-w-full border-collapse text-sm text-slate-700",
          props.className
        )}
      />
    </div>
  ),
  thead: (props) => (
    <thead {...props} className={cx("bg-slate-50", props.className)} />
  ),
  tbody: (props) => (
    <tbody
      {...props}
      className={cx("[&_tr:last-child>td]:border-b-0", props.className)}
    />
  ),
  tr: (props) => (
    <tr
      {...props}
      className={cx("border-b border-slate-200 align-top", props.className)}
    />
  ),
  th: (props) => (
    <th
      {...props}
      className={cx(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600",
        props.className
      )}
    />
  ),
  td: (props) => (
    <td
      {...props}
      className={cx("px-4 py-3 leading-7 text-slate-700", props.className)}
    />
  ),
  code: (props) => (
    <code
      {...props}
      className={cx(
        "rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-slate-800",
        props.className
      )}
    />
  ),
  pre: (props) => (
    <pre
      {...props}
      className={cx(
        "mt-6 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm leading-7 text-slate-100 shadow-sm",
        props.className
      )}
    />
  ),
  Callout,
};
