import { SectionCard } from "@/components/ui/SectionCard";
import { StaticPageLayout } from "@/components/ui/StaticPageLayout";
import { LegalPageHeader } from "@/components/legal/LegalPageHeader";
import { LegalSection } from "@/components/legal/LegalSection";
import { StaticPageHead } from "@/components/ui/StaticPageHead";

export const metadata = {
  title: "プライバシーポリシー | プロ野球 雨天中止予報",
  description: "プライバシーポリシー",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout>
      <StaticPageHead>
        <LegalPageHeader
          title="プライバシーポリシー"
          description="本サイトにおける情報の取り扱いについての方針です。"
        />
      </StaticPageHead>

      <SectionCard className="space-y-6 p-6">
        <LegalSection divider>
          <p>
            本プライバシーポリシーは、当サイト（以下「本サイト」）における、ユーザーの情報の取り扱いについて定めるものです。
          </p>
        </LegalSection>

        <LegalSection title="1. 個人情報の取得について" divider>
          <p>
            本サイトでは、氏名、メールアドレス、住所、電話番号等の
            <span className="font-semibold">
              個人を特定できる情報をユーザーから直接取得することはありません
            </span>
            。
          </p>
          <p>
            ただし、本サイトの利用にあたり、以下の情報が自動的に取得される場合があります。
          </p>
          <ul className="list-disc space-y-1 pl-6 text-sm text-muted">
            <li>IPアドレス</li>
            <li>ブラウザの種類</li>
            <li>OS</li>
            <li>アクセス日時</li>
            <li>閲覧ページ</li>
            <li>Cookie 等の識別情報</li>
          </ul>
          <p>
            これらの情報は、個人を特定する目的で利用するものではありません。
          </p>
        </LegalSection>

        <LegalSection title="2. 情報の利用目的" divider>
          <p>本サイトでは、取得した情報を以下の目的で利用します。</p>
          <ul className="list-disc space-y-1 pl-6 text-sm text-muted">
            <li>本サイトの運営および維持管理のため</li>
            <li>利用状況の把握・分析によるサービス改善のため</li>
            <li>不正アクセスや不正利用の防止のため</li>
            <li>広告配信およびその効果測定のため</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. アクセス解析ツールについて" divider>
          <p>
            本サイトでは、利用状況を把握し、サービス改善に役立てるために、第三者が提供するアクセス解析ツール（例：Cloudflare
            Web Analytics）を利用する場合があります。
          </p>
          <p>
            これらのアクセス解析ツールでは、Cookieを使用してトラフィックデータを収集することがありますが、収集されるデータは匿名であり、個人を特定するものではありません。
          </p>
          <p>
            Cookieの使用を望まない場合は、ブラウザの設定により無効にすることが可能です。
          </p>
        </LegalSection>

        <LegalSection title="4. 広告配信について" divider>
          <p>
            本サイトでは、第三者配信の広告サービス（例：Google
            AdSense）を利用する場合があります。
          </p>
          <p>
            これらの広告配信事業者は、ユーザーの興味に応じた広告を表示するため、Cookieを使用することがあります。
            <br />
            これにより取得される情報には、氏名、住所、メールアドレス、電話番号等の
            <span className="font-semibold">
              個人を特定できる情報は含まれません
            </span>
            。
          </p>
          <p>
            パーソナライズ広告を無効にする方法については、各広告配信事業者の提供するオプトアウト手段をご確認ください。
          </p>
        </LegalSection>

        <LegalSection title="5. Cookieの使用について" divider>
          <p>
            本サイトでは、以下の目的のためにCookieを使用することがあります。
          </p>
          <ul className="list-disc space-y-1 pl-6 text-sm text-muted">
            <li>アクセス解析</li>
            <li>広告配信</li>
            <li>サイトの利便性向上</li>
          </ul>
          <p>
            Cookieはユーザーのブラウザに保存される小さなデータであり、個人を特定する情報は含まれません。
          </p>
          <p>
            ユーザーはブラウザの設定により、Cookieの使用を拒否することができます。ただし、Cookieを無効にした場合、本サイトの一部機能が正常に動作しない場合があります。
          </p>
        </LegalSection>

        <LegalSection title="6. 第三者への情報提供について" divider>
          <p>
            本サイトでは、法令に基づく場合を除き、取得した情報を第三者に提供することはありません。
          </p>
          <p>
            ただし、広告配信およびアクセス解析においては、第三者のサービスを利用するため、これらの事業者がそれぞれのプライバシーポリシーに基づいて情報を取り扱う場合があります。
          </p>
        </LegalSection>

        <LegalSection title="7. 免責事項" divider>
          <p>
            本サイトに掲載している情報（試合情報、天候情報、雨天中止予測確率等）は、公開情報や独自の分析に基づいて提供していますが、その正確性、完全性、最新性を保証するものではありません。
          </p>
          <p>
            また、雨天中止予測確率はあくまで
            <span className="font-semibold">予測値</span>
            であり、実際の試合開催・中止を保証するものではありません。
          </p>
          <p>
            本サイトの情報を利用したことにより生じた損害について、運営者は一切の責任を負いません。
          </p>
        </LegalSection>

        <LegalSection title="8. プライバシーポリシーの変更について" divider>
          <p>
            本プライバシーポリシーの内容は、法令の改正や本サイトの運営方針の変更により、予告なく変更されることがあります。
          </p>
          <p>
            変更後のプライバシーポリシーは、本サイトに掲載した時点で効力を生じるものとします。
          </p>
        </LegalSection>

        <LegalSection title="9. お問い合わせ" divider={false}>
          <p>
            本サイトのプライバシーポリシーに関するお問い合わせは、以下の方法にてご連絡ください。
          </p>
          <ul className="list-disc space-y-1 pl-6 text-sm text-muted">
            <li>
              運営者名：
              <span className="font-semibold">
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
              </span>
            </li>
            <li>
              お問い合わせ先：
              <span className="font-semibold">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf_bC-Us0r_OAH673EDtIJLlLmerFSSFX8s470W5hdliKQjTw/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-muted underline underline-offset-2 hover:text-strong"
                >
                  お問い合わせフォーム
                </a>
              </span>
            </li>
          </ul>
        </LegalSection>
      </SectionCard>
    </StaticPageLayout>
  );
}
