import { SectionCard } from "@/components/ui/SectionCard";
import { StaticPageHead } from "@/components/ui/StaticPageHead";
import { StaticPageLayout } from "@/components/ui/StaticPageLayout";

export const metadata = {
  title: "このサイトについて | プロ野球 雨天中止予報",
  description: "このサイトについて",
  alternates: {
    canonical: "/about",
  },
};

export default function CompanyPage() {
  return (
    <StaticPageLayout>
      <StaticPageHead>
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-strong">このサイトについて</h1>
          <p className="text-sm text-muted">
            本サイトの運営形態や連絡先、サイト概要など、基本情報をまとめています。
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
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">運営形態</p>
            <p className="font-semibold text-strong">個人運営</p>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">所在地</p>
            <p className="font-semibold text-strong">日本国内</p>
            <p className="text-xs text-muted">
              個人運営のため、詳細な住所は公開していません。
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4 sm:col-span-2">
            <p className="text-xs font-semibold text-muted">運営者</p>
            <p className="font-semibold text-strong">
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
            </p>
            <p className="text-xs text-muted">
              本サイトは個人により運営されており、特定の球団、リーグ、団体とは一切関係ありません。
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4 sm:col-span-2">
            <p className="text-xs font-semibold text-muted">連絡先</p>
            <p className="font-semibold text-strong">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSf-O5dp6S-vRDt4VZJII71E71Z3t53BEgOpEsO56W1NMLT8QA/viewform?usp=dialog"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-muted underline underline-offset-2 hover:text-strong"
              >
                お問い合わせフォーム
              </a>
            </p>
            <p className="text-xs text-muted">
              お問い合わせ内容によっては、返信できない場合があります。あらかじめご了承ください。
            </p>
          </div>
        </SectionCard>

        <SectionCard className="space-y-4 border border-slate-200 bg-slate-100/70 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-1.5 rounded-full bg-slate-400" />
              <h2 className="text-lg font-semibold text-strong">サイト概要</h2>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">このサイトの概要</p>
            <p className="font-semibold">
              本サイトは、日本のプロ野球の試合情報および天候データをもとに、雨天中止の可能性を予測・可視化する情報提供サイトです。
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">
              このサイトを作った経緯と目的
            </p>
            <p className="font-medium">
              運営者は大のプロ野球ファンです。
              贔屓のチームの試合が雨で中止になるかもという状況になるとソワソワしてしまいます。
              そして、天気と公式情報とにらめっこしてしまって仕事が手につかなくなります。
              <br />
              さすがにこれではいけないので、せめてにらめっこは辞めようと思い、天気と中止確率、試合開催可否を一度に確認できるサイトを作りました。
            </p>
          </div>
          <div className="space-y-1 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">
              こんな人におすすめ
            </p>
            <p className="font-medium">
              ・好きなチームの試合がないかもと思うとソワソワしてしまう人
              <br />
              ・好きなチームの試合開催球場周辺の天気をX(Twitter)で検索してしまう人
              <br />
              ・好きなチームの公式情報、公式アカウントに張り付いている人
              <br />
              ・「この雨だと今日は試合がないだろう」と割り切れないくらいプロ野球が好きな人
            </p>
          </div>
        </SectionCard>

        <SectionCard className="space-y-4 border border-slate-200 bg-slate-100/70 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-1.5 rounded-full bg-slate-400" />
              <h2 className="text-lg font-semibold text-strong">
                事業について
              </h2>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">事業内容</p>
            <ul className="list-disc space-y-1 pl-6 font-medium">
              <li>プロ野球試合に関する情報の収集および整理</li>
              <li>天候データをもとにした雨天中止予測確率の算出</li>
              <li>上記情報のWebサイト上での公開・提供</li>
            </ul>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">収益について</p>
            <p className="font-medium">
              本サイトは、運営維持および改善を目的として、第三者配信の広告サービスによる広告収益を得る場合があります。
            </p>
          </div>
        </SectionCard>

        <SectionCard className="space-y-4 border border-slate-200 bg-slate-100/70 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-1.5 rounded-full bg-slate-400" />
              <h2 className="text-lg font-semibold text-strong">
                ご利用上の注意
              </h2>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">
              データおよび情報の取り扱いについて
            </p>
            <p className="font-semibold">
              本サイトにおける個人情報およびアクセス情報の取り扱いについては、別途掲載する「プライバシーポリシー」をご確認ください。
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">免責事項</p>
            <p className="font-semibold">
              本サイトに掲載されている情報は、公開情報や独自の分析に基づいて提供していますが、その正確性、完全性、最新性を保証するものではありません。
              <br />
              本サイトの情報を利用したことにより生じたいかなる損害についても、運営者は一切の責任を負いません。
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-white/80 bg-white/90 p-4">
            <p className="text-xs font-semibold text-muted">適用関係</p>
            <p className="font-semibold">
              本サイトの利用にあたっては、「利用規約」および「プライバシーポリシー」が適用されます。
            </p>
          </div>
        </SectionCard>
      </div>
    </StaticPageLayout>
  );
}
