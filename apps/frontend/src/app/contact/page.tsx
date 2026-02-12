import { StaticPageHead } from "@/components/ui/StaticPageHead";
import { StaticPageLayout } from "@/components/ui/StaticPageLayout";

export const metadata = {
  title: "お問い合わせ先 | プロ野球 雨天中止予報",
  description: "お問い合わせフォーム",
};

export default function ContactPage() {
  return (
    <StaticPageLayout maxWidth="6xl">
      <StaticPageHead>
        <header>
          <h1 className="text-2xl font-bold text-strong">お問い合わせ先</h1>
          <p className="text-sm text-muted">
            以下のフォームからお問い合わせください。
          </p>
        </header>
      </StaticPageHead>
      <iframe
        title="お問い合わせフォーム"
        src="https://docs.google.com/forms/d/e/1FAIpQLSf-O5dp6S-vRDt4VZJII71E71Z3t53BEgOpEsO56W1NMLT8QA/viewform?embedded=true"
        className="w-full h-[900px] rounded-xl border-0 bg-transparent"
        loading="lazy"
      />
    </StaticPageLayout>
  );
}
