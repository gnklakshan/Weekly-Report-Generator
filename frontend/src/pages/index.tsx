import { useEffect } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/hooks/use-auth";

/** Session-aware entry point: straight to the workspace or to sign in. */
export default function Index() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      void router.replace("/dashboard");
    }
    if (status === "unauthenticated") {
      void router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <p className="text-sm text-muted-foreground">Loading workspace…</p>
    </div>
  );
}
