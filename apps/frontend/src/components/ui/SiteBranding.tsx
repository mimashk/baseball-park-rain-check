import Link from "next/link";
import Image from "next/image";

export function SiteBranding() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 sm:gap-3 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--border)] rounded-lg"
      aria-label="トップページへ"
    >
      <Image
        src="/logo/logo.webp"
        alt=""
        width={80}
        height={80}
        sizes="(max-width: 640px) 24px, 80px"
        priority
        className="h-6 w-6 object-contain sm:h-20 sm:w-20"
      />
      <h1 className="font-bold text-strong leading-tight text-xl sm:text-3xl">
        <span className="block text-sm sm:text-xl">プロ野球</span>
        <span className="block">雨天中止予報</span>
      </h1>
    </Link>
  );
}
