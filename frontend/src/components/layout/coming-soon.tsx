import { PageHeader } from "./page-header";
import { RequirePermission } from "./require-permission";
import { Card, CardContent } from "@/components/ui/card";
import type { Permission } from "@/types";

/** Shell-only page used until the feature screens land in a later phase. */
export function ComingSoon({
  title,
  description,
  permissions,
}: {
  title: string;
  description: string;
  permissions: Permission[];
}) {
  return (
    <RequirePermission permissions={permissions}>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          This screen is part of an upcoming phase. The layout, navigation and access rules for it
          are already in place.
        </CardContent>
      </Card>
    </RequirePermission>
  );
}
