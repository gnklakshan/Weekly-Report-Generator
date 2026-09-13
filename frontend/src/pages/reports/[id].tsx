import type { ReactElement } from "react";
import { useRouter } from "next/router";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { RequirePermission } from "@/components/layout/require-permission";
import { LoadingState } from "@/components/common/loading-state";
import { ReportDetail } from "@/components/reports/report-detail";

export default function ReportDetailPage() {
  const router = useRouter();
  const reportId = typeof router.query.id === "string" ? router.query.id : undefined;

  return (
    <RequirePermission permissions={["VIEW_OWN_REPORTS", "VIEW_TEAM_REPORTS"]}>
      <div className="mx-auto max-w-6xl">
        {/* Dynamic route params are empty until hydration. */}
        {router.isReady && reportId ? (
          <ReportDetail reportId={reportId} />
        ) : (
          <LoadingState type="detail" />
        )}
      </div>
    </RequirePermission>
  );
}

ReportDetailPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
