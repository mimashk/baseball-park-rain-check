type Props = {
  children: React.ReactNode;
};

export function SectionEyebrow({ children }: Props) {
  return (
    <>
      <p className="text-xs md:text-lg font-semibold uppercase tracking-[0.08em] leading-none text-muted">
        {children}
      </p>
      <div className="h-[2px] w-full bg-[color:var(--border)]" />
    </>
  );
}
