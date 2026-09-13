import type { ReactElement } from "react";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { RequirePermission } from "@/components/layout/require-permission";
import { ProjectsManager } from "@/components/projects/projects-manager";

/**
 * Managers and admins manage projects; team members who navigate here directly
 * still get the read-only list (the manager component hides the actions).
 */
export default function ProjectsPage() {
  return (
    <RequirePermission permissions={["MANAGE_PROJECTS", "VIEW_OWN_REPORTS"]}>
      <ProjectsManager />
    </RequirePermission>
  );
}

ProjectsPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
