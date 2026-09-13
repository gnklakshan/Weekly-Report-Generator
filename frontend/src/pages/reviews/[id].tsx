import type { ReactElement } from "react";
import { useRouter } from "next/router";

import { LoadingState } from "@/components/common/loading-state";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { RequirePermission } from "@/components/layout/require-permission";
import { ReviewDetail } from "@/components/reviews/review-detail";

export default function ReviewPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : undefined;

  if (!router.isReady || !id) {
    return <LoadingState type="detail" />;
  }

  return (
    <RequirePermission permissions={["REVIEW_REPORT"]}>
      <ReviewDetail key={id} reportId={id} />
    </RequirePermission>
  );
}

ReviewPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
