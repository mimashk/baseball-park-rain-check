"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  tagSrc: string;
  title: string;
  initialHeight?: number;
};

export function ShinobiAdFrame({
  tagSrc,
  title,
  initialHeight = 250,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(initialHeight);
  const srcDoc = useMemo(
    () => `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script src="${tagSrc}"></script>
  </body>
</html>`,
    [tagSrc]
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let intervalId: number | undefined;

    const syncHeight = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const nextHeight = Math.max(
        initialHeight,
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight ?? 0
      );
      setHeight((current) => (current === nextHeight ? current : nextHeight));
    };

    const handleLoad = () => {
      syncHeight();
      intervalId = window.setInterval(syncHeight, 500);
    };

    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [initialHeight, srcDoc]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={srcDoc}
      scrolling="no"
      style={{
        width: "100%",
        height,
        border: 0,
        display: "block",
        margin: "0 auto",
        overflow: "hidden",
      }}
    />
  );
}
