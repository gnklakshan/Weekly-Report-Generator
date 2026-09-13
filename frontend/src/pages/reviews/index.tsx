import type { ReactElement } from "react";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RequirePermission } from "@/components/layout/require-permission";
import { ReviewQueue } from "@/components/reviews/review-queue";
import { useAuth } from "@/hooks/use-auth";
import { useReview } from "@/hooks/use-review";

export default function ReviewsPage() {
  const { user } = useAuth();
  const { queue, isLoading, error, refetch } = useReview(user?.id);

  return (
    <RequirePermission permissions={["REVIEW_REPORT"]}>
      <PageHeader
        title="Reviews"
        description="Reports submitted by your team awaiting your review."
      />
      <ReviewQueue queue={queue} isLoading={isLoading} error={error} onRetry={refetch} />
    </RequirePermission>
  );
}

ReviewsPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
