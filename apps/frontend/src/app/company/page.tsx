import { SectionCard } from "@/components/ui/SectionCard";
import { StaticPageHead } from "@/components/ui/StaticPageHead";
import { StaticPageLayout } from "@/components/ui/StaticPageLayout";

export const metadata = {
  title: "運営元情報 | プロ野球 雨天中止予報",
  description: "運営元情報",
  alternates: {
    canonical: "/company",
  },
};

export default function CompanyPage() {
  return (
    <StaticPageLayout>
      <StaticPageHead>
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-strong">運営元情報</h1>
          <p className="text-sm text-muted">
            本サイトの運営形態や連絡先など、基本情報をまとめています。
          </p>
        </header>
      </StaticPageHead>

      <div className="space-y-6">
        <SectionCard className="space-y-4 border border-slate-200 bg-slate-100/70 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-1.5 rounded-full bg-slate-400" />
              <h2 className="text-lg font-semibold text-strong">基本情報</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-muted">
              BASIC
            </span>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1 rounded-lg border border-white/80 bg-white/90 p-4">
              <dt className="text-xs font-semibold text-muted">運営形態</dt>
              <dd className="font-semibold text-strong">個人運営</dd>
            </div>
            <div className="space-y-1 rounded-lg border border-white/80 bg-white/90 p-4">
              <dt className="text-xs font-semibold text-muted">所在地</dt>
              <dd className="font-semibold text-strong">日本国内</dd>
              <p className="text-xs text-muted">
                個人運営のため、詳細な住所は公開していません。
              </p>
            </div>
            <div className="space-y-1 rounded-lg border border-white/80 bg-white/90 p-4 sm:col-span-2">
              <dt className="text-xs font-semibold text-muted">運営者</dt>
              <dd className="font-semibold text-strong">
                プロ野球 雨天中止予報（{" "}
                <a
                  href="https://x.com/bb_raincheck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-muted underline underline-offset-2 hover:text-strong"
                >
                  @bb_raincheck
                </a>
                ）
              </dd>
              <p className="text-xs text-muted">
                本サイトは個人により運営されており、特定の球団、リーグ、団体とは一切関係ありません。
              </p>
            </div>
            <div className="space-y-1 rounded-lg border border-white/80 bg-white/90 p-4 sm:col-span-2">
              <dt className="text-xs font-semibold text-muted">連絡先</dt>
              <dd className="font-semibold text-strong">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf_bC-Us0r_OAH673EDtIJLlLmerFSSFX8s470W5hdliKQjTw/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-muted underline underline-offset-2 hover:text-strong"
                >
                  お問い合わせフォーム
                </a>
              </dd>
              <p className="text-xs text-muted">
                お問い合わせ内容によっては、返信できない場合があります。あらかじめご了承ください。
              </p>
            </div>
          </dl>
        </SectionCard>

        <SectionCard className="relative space-y-3 p-6 pl-8">
          <span className="absolute left-4 top-6 h-8 w-1 rounded-full bg-slate-200" />
          <h2 className="text-lg font-semibold text-strong">サイト概要</h2>
          <p>
            本サイトは、日本のプロ野球の試合情報および天候データをもとに、雨天中止の可能性を予測・可視化する情報提供サイトです。
          </p>
          <p>
            試合の開催可否を保証するものではなく、観戦計画や情報収集の参考としてご利用いただくことを目的としています。
          </p>
        </SectionCard>

        <SectionCard className="relative space-y-3 p-6 pl-8">
          <span className="absolute left-4 top-6 h-8 w-1 rounded-full bg-slate-200" />
          <h2 className="text-lg font-semibold text-strong">事業内容</h2>
          <ul className="list-disc space-y-1 pl-6 text-sm text-muted">
            <li>プロ野球試合に関する情報の収集および整理</li>
            <li>天候データをもとにした雨天中止予測確率の算出</li>
            <li>上記情報のWebサイト上での公開・提供</li>
          </ul>
        </SectionCard>

        <SectionCard className="relative space-y-3 p-6 pl-8">
          <span className="absolute left-4 top-6 h-8 w-1 rounded-full bg-slate-200" />
          <h2 className="text-lg font-semibold text-strong">収益について</h2>
          <p>
            本サイトは、運営維持および改善を目的として、第三者配信の広告サービスによる広告収益を得る場合があります。
          </p>
        </SectionCard>

        <SectionCard className="relative space-y-3 p-6 pl-8">
          <span className="absolute left-4 top-6 h-8 w-1 rounded-full bg-slate-200" />
          <h2 className="text-lg font-semibold text-strong">
            データおよび情報の取り扱いについて
          </h2>
          <p>
            本サイトにおける個人情報およびアクセス情報の取り扱いについては、別途掲載する「プライバシーポリシー」をご確認ください。
          </p>
        </SectionCard>

        <SectionCard className="relative space-y-3 p-6 pl-8">
          <span className="absolute left-4 top-6 h-8 w-1 rounded-full bg-slate-200" />
          <h2 className="text-lg font-semibold text-strong">免責事項</h2>
          <p>
            本サイトに掲載されている情報は、公開情報や独自の分析に基づいて提供していますが、その正確性、完全性、最新性を保証するものではありません。
          </p>
          <p>
            本サイトの情報を利用したことにより生じたいかなる損害についても、運営者は一切の責任を負いません。
          </p>
        </SectionCard>

        <SectionCard className="relative space-y-3 p-6 pl-8">
          <span className="absolute left-4 top-6 h-8 w-1 rounded-full bg-slate-200" />
          <h2 className="text-lg font-semibold text-strong">適用関係</h2>
          <p>
            本サイトの利用にあたっては、「利用規約」および「プライバシーポリシー」が適用されます。
          </p>
        </SectionCard>
      </div>
    </StaticPageLayout>
  );
}
