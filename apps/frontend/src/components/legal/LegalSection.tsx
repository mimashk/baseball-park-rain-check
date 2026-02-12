import type { ReactNode } from "react";

type Props = {
  /** セクション見出し（h2）。省略時は見出しなし */
  title?: ReactNode;
  children: ReactNode;
  /** 下の区切り線を表示するか。最後のセクションは false に */
  divider?: boolean;
};

export function LegalSection({
  title,
  children,
  divider = true,
}: Props) {
  return (
    <section className="space-y-3">
      {title != null && (
        <h2 className="text-lg font-semibold text-strong">{title}</h2>
      )}
      {children}
      {divider && <hr className="border-muted/30" />}
    </section>
  );
}
