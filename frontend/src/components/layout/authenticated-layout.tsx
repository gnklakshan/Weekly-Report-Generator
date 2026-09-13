import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export function AuthenticatedLayout({ children }: { children?: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      void router.replace({ pathname: "/login", query: { redirect: router.asPath } });
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen space-y-4 p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
