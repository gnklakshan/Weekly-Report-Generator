import type { ReactElement } from "react";
import { useRouter } from "next/router";

import { LoadingState } from "@/components/common/loading-state";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { RequirePermission } from "@/components/layout/require-permission";
import { TeamMemberProfile } from "@/components/team/team-member-profile";

export default function TeamMemberPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  // This page is statically optimised, so router.query is empty until hydration.
  // Reading it earlier would fetch with `undefined` and flash a false "not found".
  if (!router.isReady || !id) {
    return <LoadingState type="detail" />;
  }

  return (
    <RequirePermission permissions={["VIEW_TEAM_MEMBERS"]}>
      {/* The key remounts the profile when navigating between members, resetting its data hooks. */}
      <TeamMemberProfile key={id} memberId={id} />
    </RequirePermission>
  );
}

TeamMemberPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
