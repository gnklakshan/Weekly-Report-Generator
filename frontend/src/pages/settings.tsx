import type { ReactElement } from "react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABEL, USER_STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/date";

export default function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    { label: "Full name", value: user.fullName },
    { label: "Email", value: user.email },
    { label: "Job title", value: user.jobTitle },
    { label: "Joined", value: formatDate(user.joinedAt) },
  ];

  return (
    <>
      <PageHeader title="Settings" description="Your profile and workspace preferences." />
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Profile</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
            <Badge variant="outline">{USER_STATUS_LABEL[user.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </>
  );
}

SettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
