import { AlertTriangle, CircleAlert, FileText, Gauge } from "lucide-react";

import type { DashboardMetrics } from "@/types";
import { MetricCard, type MetricTone } from "./metric-card";

interface MetricsRowProps {
  metrics: DashboardMetrics;
  loading?: boolean;
}

function complianceTone(rate: number): MetricTone {
  if (rate >= 90) return "positive";
  if (rate >= 60) return "warning";
  return "destructive";
}

/**
 * The four headline KPIs. Every number comes straight from `metrics`
 * (derived by the dashboard service from the report dataset) — nothing is
 * hard-coded or re-computed here.
 */
export function MetricsRow({ metrics, loading = false }: MetricsRowProps) {
  const correctionHint =
    metrics.needsCorrection === 1
      ? "report awaiting correction"
      : "reports awaiting correction";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={FileText}
        label="Reports Submitted"
        value={`${metrics.submittedReports} / ${metrics.expectedReports}`}
        hint={`${metrics.approved} approved`}
        loading={loading}
      />
      <MetricCard
        icon={Gauge}
        label="Compliance Rate"
        value={`${metrics.complianceRate}%`}
        hint="of expected reports"
        tone={complianceTone(metrics.complianceRate)}
        loading={loading}
      />
      <MetricCard
        icon={AlertTriangle}
        label="Needs Correction"
        value={`${metrics.needsCorrection}`}
        hint={correctionHint}
        tone={metrics.needsCorrection > 0 ? "warning" : "default"}
        loading={loading}
      />
      <MetricCard
        icon={CircleAlert}
        label="Open Blockers"
        value={`${metrics.openBlockers}`}
        hint="in unapproved reports"
        tone={metrics.openBlockers > 0 ? "destructive" : "positive"}
        loading={loading}
      />
    </div>
  );
}
