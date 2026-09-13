import type { ReactElement } from "react";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { RequirePermission } from "@/components/layout/require-permission";
import { TeamDirectory } from "@/components/team/team-directory";

export default function TeamPage() {
  return (
    <RequirePermission permissions={["VIEW_TEAM_MEMBERS"]}>
      <TeamDirectory />
    </RequirePermission>
  );
}

TeamPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
