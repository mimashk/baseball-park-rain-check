import type { ReactNode } from "react";
import { SiteBranding } from "@/components/ui/SiteBranding";

type Props = {
  children: ReactNode;
};

export function StaticPageHead({ children }: Props) {
  return (
    <>
      <SiteBranding />
      <div className="mt-6 border-t border-[color:var(--border)] pt-6">
        {children}
      </div>
    </>
  );
}
