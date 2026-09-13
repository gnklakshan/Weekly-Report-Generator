import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import type { Permission } from "@/types";

/**
 * Renders children only when the signed-in user holds one of the permissions.
 * Route gating happens in the layout; this guards page-level content.
 */
export function RequirePermission({
  permissions,
  children,
}: {
  permissions: Permission[];
  children: ReactNode;
}) {
  const { hasAnyPermission } = useAuth();
  if (hasAnyPermission(permissions)) return <>{children}</>;

  return (
    <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
      <ShieldAlert className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold">You don&rsquo;t have access</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your role doesn&rsquo;t include permission for this area. Contact a workspace administrator if you
        think this is a mistake.
      </p>
    </div>
  );
}
