import Link from "next/link";
import { UserRoundX } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

/** Shown when the id in the URL matches nobody in the workspace. */
export function MemberNotFound({ memberId }: { memberId: string }) {
  return (
    <>
      <PageHeader
        title="Member not found"
        breadcrumbs={[{ label: "Team", href: "/team" }, { label: "Not found" }]}
      />
      <EmptyState
        icon={UserRoundX}
        title="This profile is unavailable"
        description={`Nobody in the workspace matches "${memberId}". They may have been removed, or the link you followed may be out of date.`}
      >
        <Button asChild size="sm" variant="outline">
          <Link href="/team">Back to team</Link>
        </Button>
      </EmptyState>
    </>
  );
}
