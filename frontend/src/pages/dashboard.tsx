import type { ReactElement } from "react";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RequirePermission } from "@/components/layout/require-permission";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { hasPermission } = useAuth();
  const isManager = hasPermission("VIEW_DASHBOARD");

  return (
    <RequirePermission permissions={["VIEW_DASHBOARD", "VIEW_OWN_REPORTS"]}>
      <PageHeader
        title="Dashboard"
        description={
          isManager
            ? "Team reporting health, workload and activity for the selected week."
            : "Your weekly reporting summary, progress and tasks completed."
        }
      />
      <DashboardView />
    </RequirePermission>
  );
}

DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
