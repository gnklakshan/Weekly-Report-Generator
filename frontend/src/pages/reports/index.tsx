import type { ReactElement } from "react";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { RequirePermission } from "@/components/layout/require-permission";
import { ReportsHistory } from "@/components/reports/reports-history";

export default function ReportsIndexPage() {
  return (
    <RequirePermission permissions={["VIEW_OWN_REPORTS", "VIEW_TEAM_REPORTS"]}>
      <ReportsHistory />
    </RequirePermission>
  );
}

ReportsIndexPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
