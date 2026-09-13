import { useMemo, useState } from "react";

import { DataTablePagination } from "@/components/common/data-table-pagination";
import { ReportTable } from "@/components/reports/report-table";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Project, Report, User } from "@/types";

interface MemberReportHistoryProps {
  reports: Report[];
  projects: Project[];
  users: User[];
}

/** Read-only report history for the member being viewed — no owner actions are passed. */
export function MemberReportHistory({ reports, projects, users }: MemberReportHistoryProps) {
  const [page, setPage] = useState(1);

  const pageReports = useMemo(() => {
    const start = (page - 1) * DEFAULT_PAGE_SIZE;
    return reports.slice(start, start + DEFAULT_PAGE_SIZE);
  }, [reports, page]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">Report history</h2>
        <p className="text-xs text-muted-foreground">
          {reports.length} {reports.length === 1 ? "report" : "reports"} on file
        </p>
      </div>

      {reports.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card/50 px-6 py-10 text-center text-xs italic text-muted-foreground">
          This member has not filed any weekly reports yet.
        </p>
      ) : (
        <>
          <ReportTable reports={pageReports} projects={projects} users={users} />
          <DataTablePagination
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            totalItems={reports.length}
            onPageChange={setPage}
            itemLabel="reports"
          />
        </>
      )}
    </section>
  );
}
