type Props = { label: string; children: React.ReactNode };

export function InfoRow({ label, children }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </div>
  );
}
