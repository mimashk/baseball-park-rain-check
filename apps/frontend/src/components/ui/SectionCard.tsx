type Props = React.PropsWithChildren<{ className?: string }>;

export function SectionCard({ className = "", children }: Props) {
  return <section className={`card ${className}`}>{children}</section>;
}
