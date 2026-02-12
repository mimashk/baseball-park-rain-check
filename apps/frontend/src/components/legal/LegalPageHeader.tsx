type Props = {
  title: string;
  description: string;
};

export function LegalPageHeader({ title, description }: Props) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-bold text-strong">{title}</h1>
      <p className="text-sm text-muted">{description}</p>
    </header>
  );
}
