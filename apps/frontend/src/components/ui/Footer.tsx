import Link from "next/link";

const links = [
  { href: "/", label: "ホーム" },
  { href: "/contact", label: "お問い合わせ先" },
  { href: "/privacy-policy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
  { href: "/about", label: "このサイトについて" },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-white/70">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>© 2026 プロ野球 雨天中止予報</p>
        <nav aria-label="フッターリンク">
          <ul className="flex flex-wrap gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link className="hover:text-strong" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
