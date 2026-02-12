import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 最大幅。contact は 6xl、それ以外は 5xl が向いている */
  maxWidth?: "5xl" | "6xl";
  className?: string;
};

const maxWidthClass = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
} as const;

export function StaticPageLayout({
  children,
  maxWidth = "5xl",
  className = "",
}: Props) {
  return (
    <main
      className={`mx-auto flex flex-col gap-6 px-4 py-10 ${maxWidthClass[maxWidth]} ${className}`.trim()}
    >
      {children}
    </main>
  );
}
