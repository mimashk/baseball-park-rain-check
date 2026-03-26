export type FaqItem = {
  id: string;
  question: string;
  answer: string | string[];
};

type Props = {
  items: FaqItem[];
  eyebrow?: string;
  className?: string;
};

export function FaqSection({ items, className = "" }: Props) {
  return (
    <section className={`space-y-2 ${className}`.trim()} aria-label="FAQ">
      <div className="rounded-2xl border border-[color:var(--border)] bg-white/75 shadow-sm">
        <ul className="divide-y divide-[color:var(--border)]">
          {items.map((item) => (
            <li key={item.id} className="px-4 py-3 md:px-5 md:py-4">
              <details className="group">
                <summary className="cursor-pointer list-none pr-6 text-sm md:text-base font-semibold text-strong">
                  Q. {item.question}
                </summary>

                <div className="mt-2 text-xs md:text-sm leading-6 text-muted">
                  {Array.isArray(item.answer) ? (
                    <ul className="space-y-1">
                      {item.answer.map((line, i) => (
                        <li key={i}>A. {line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>A. {item.answer}</p>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
