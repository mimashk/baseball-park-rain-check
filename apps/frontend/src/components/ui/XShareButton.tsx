"use client";

import Image from "next/image";

type XShareButtonProps = {
  text: string;
  url: string;
  hashtags?: string[];
  via?: string;
};

export function XShareButton({
  text,
  url,
  hashtags = [],
  via,
}: XShareButtonProps) {
  const params = new URLSearchParams();
  params.set("text", text);
  params.set("url", url);
  if (hashtags.length > 0) params.set("hashtags", hashtags.join(","));
  if (via) params.set("via", via);

  const intentUrl = `https://twitter.com/intent/tweet?${params.toString()}`;

  return (
    <a
      href={intentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border bg-black shadow-sm overflow-hidden transition hover:-translate-y-0.5 hover:bg-zinc-900"
    >
      <Image
        src="/share/x-icon-white.webp"
        alt="Xでシェア"
        width={20}
        height={20}
        sizes="20px"
        className="h-5 w-5 object-contain"
      />
    </a>
  );
}
