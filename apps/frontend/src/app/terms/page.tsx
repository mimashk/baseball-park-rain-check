import { SectionCard } from "@/components/ui/SectionCard";
import { StaticPageLayout } from "@/components/ui/StaticPageLayout";
import { LegalPageHeader } from "@/components/legal/LegalPageHeader";
import { LegalSection } from "@/components/legal/LegalSection";
import { StaticPageHead } from "@/components/ui/StaticPageHead";

export const metadata = {
  title: "利用規約 | プロ野球 雨天中止予報",
  description: "利用規約",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <StaticPageLayout>
      <StaticPageHead>
        <LegalPageHeader
          title="利用規約"
          description="本サービスの利用条件と、ユーザーが守るべき事項を定めます。"
        />
      </StaticPageHead>

      <SectionCard className="space-y-6 p-6">
        <LegalSection divider>
          <p>
            本利用規約（以下「本規約」）は、当サイト（以下「本サービス」）が提供する各種情報および機能の利用条件を定めるものです。
            <br />
            ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
          </p>
        </LegalSection>

        <LegalSection title="第1条（適用）" divider>
          <p>
            本規約は、ユーザーと本サービスの運営者（以下「運営者」）との間の、本サービスの利用に関わる一切の関係に適用されるものとします。
          </p>
        </LegalSection>

        <LegalSection title="第2条（提供内容）" divider>
          <p>
            本サービスは、日本のプロ野球に関する試合情報および天候情報等をもとに、雨天中止の可能性に関する予測情報を提供する情報提供サービスです。
          </p>
          <p>
            本サービスで提供される情報は、公開情報や独自の分析に基づくものであり、特定の結果を保証するものではありません。
          </p>
        </LegalSection>

        <LegalSection title="第3条（利用条件）" divider>
          <p>
            ユーザーは、自己の責任において本サービスを利用するものとします。
          </p>
          <p>
            本サービスは、ユーザー登録やログインを必要とせず、誰でも自由に閲覧することができます。
          </p>
        </LegalSection>

        <LegalSection title="第4条（禁止事項）" divider>
          <p>
            ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。
          </p>
          <ol className="list-decimal space-y-1 pl-6 text-sm text-muted">
            <li>
              本サービスの内容を、運営者の許可なく自動取得（スクレイピング、クローリング等）する行為
            </li>
            <li>
              本サービスで提供される情報を、再配布、転載、販売、商用利用する行為
            </li>
            <li>本サービスの運営を妨害する行為</li>
            <li>法令または公序良俗に違反する行為</li>
            <li>不正アクセス、またはそれを試みる行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ol>
        </LegalSection>

        <LegalSection title="第5条（知的財産権）" divider>
          <p>
            本サービスに掲載されている文章、データ、構成、分析結果、表示方法等に関する著作権およびその他の知的財産権は、運営者または正当な権利を有する第三者に帰属します。
          </p>
          <p>
            ユーザーは、私的利用の範囲を超えてこれらを利用することはできません。
          </p>
        </LegalSection>

        <LegalSection title="第6条（外部サービスの利用）" divider>
          <p>
            本サービスでは、お問い合わせ対応のために外部サービス（例：Googleフォーム）を利用しています。
          </p>
          <p>
            ユーザーがこれらの外部サービスを利用する場合、当該サービスの利用規約およびプライバシーポリシーが適用されるものとします。
          </p>
          <p>
            また、本サービスにはSNSのシェア機能が含まれる場合がありますが、これらの利用により生じたトラブルについて、運営者は一切の責任を負いません。
          </p>
        </LegalSection>

        <LegalSection title="第7条（免責事項）" divider>
          <ol className="list-decimal space-y-1 pl-6 text-sm text-muted">
            <li>
              本サービスで提供される情報は、あくまで情報提供を目的としたものであり、その正確性、完全性、最新性を保証するものではありません。
            </li>
            <li>
              雨天中止予測確率は予測値であり、実際の試合開催・中止の結果を保証するものではありません。
            </li>
            <li>
              ユーザーが本サービスの情報を利用したことにより生じた、いかなる損害（直接的・間接的を問わない）についても、運営者は一切の責任を負いません。
            </li>
            <li>
              通信環境、システム障害、第三者による妨害行為等により、本サービスが正常に利用できない場合であっても、運営者は責任を負いません。
            </li>
          </ol>
        </LegalSection>

        <LegalSection title="第8条（サービスの変更・停止・終了）" divider>
          <p>
            運営者は、ユーザーへの事前の通知なく、本サービスの内容を変更し、または本サービスの全部もしくは一部を停止または終了することができるものとします。
          </p>
          <p>
            これによりユーザーに生じた損害について、運営者は一切の責任を負いません。
          </p>
        </LegalSection>

        <LegalSection title="第9条（未成年者の利用）" divider>
          <p>
            未成年のユーザーは、本サービスを利用するにあたり、保護者の同意を得たものとみなします。
          </p>
        </LegalSection>

        <LegalSection title="第10条（利用規約の変更）" divider>
          <p>
            運営者は、必要と判断した場合には、ユーザーに通知することなく、本規約を変更することができるものとします。
          </p>
          <p>
            変更後の利用規約は、本サービス上に掲載した時点から効力を生じるものとします。
          </p>
        </LegalSection>

        <LegalSection title="第11条（準拠法および管轄）" divider>
          <p>本規約の解釈および適用については、日本法を準拠法とします。</p>
          <p>
            本サービスに関して生じた紛争については、運営者の所在地を管轄する日本の裁判所を専属的合意管轄とします。
          </p>
        </LegalSection>

        <LegalSection title="第12条（お問い合わせ）" divider={false}>
          <p>本規約に関するお問い合わせは、以下の方法にてご連絡ください。</p>
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
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf-O5dp6S-vRDt4VZJII71E71Z3t53BEgOpEsO56W1NMLT8QA/viewform?usp=dialog"
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
