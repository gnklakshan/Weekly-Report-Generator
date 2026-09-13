import type { ReactElement } from "react";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { RequirePermission } from "@/components/layout/require-permission";
import { UsersManager } from "@/components/users/users-manager";

/** Administrator-only: MANAGE_USERS is granted to the ADMIN role alone. */
export default function UsersPage() {
  return (
    <RequirePermission permissions={["MANAGE_USERS"]}>
      <UsersManager />
    </RequirePermission>
  );
}

UsersPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
