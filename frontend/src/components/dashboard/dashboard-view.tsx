import { useAuth } from "@/hooks/use-auth";
import { PersonalSummaryView } from "./personal-summary-view";
import { TeamDashboard } from "./team-dashboard";

/**
 * Single dashboard feature entry point. Managers/admins (VIEW_DASHBOARD) get the
 * team-wide dashboard; everyone else gets a personal summary scoped to their own
 * memberId. Both read from the same `useDashboard` source.
 */
export function DashboardView() {
  const { hasPermission } = useAuth();
  return hasPermission("VIEW_DASHBOARD") ? <TeamDashboard /> : <PersonalSummaryView />;
}
