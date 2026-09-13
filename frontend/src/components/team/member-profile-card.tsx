import type { ReactNode } from "react";
import { CalendarDays, Mail, UserCog } from "lucide-react";

import { TeamMemberAvatar } from "@/components/common/team-member-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { projectColorClass } from "@/components/projects/project-options";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import type { Project, User } from "@/types";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

interface MemberProfileCardProps {
  member: User;
  /** Display name of `member.managerId`, when the member reports to someone. */
  managerName: string | null;
  projects: Project[];
}

export function MemberProfileCard({ member, managerName, projects }: MemberProfileCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Profile information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex items-center gap-4">
            <TeamMemberAvatar
              name={member.fullName}
              avatarUrl={member.avatarUrl}
              className="size-14"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{member.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{member.jobTitle}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{ROLE_LABEL[member.role]}</Badge>
                <UserStatusBadge status={member.status} />
              </div>
            </div>
          </div>

          <dl className="grid flex-1 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-2 lg:grid-cols-3 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
            <Field label="Email">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${member.email}`}
                  className="truncate hover:text-foreground hover:underline"
                >
                  {member.email}
                </a>
              </span>
            </Field>
            <Field label="Joined">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                {formatDate(member.joinedAt)}
              </span>
            </Field>
            <Field label="Reports to">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <UserCog className="size-3.5 shrink-0" aria-hidden="true" />
                {managerName ?? "No manager assigned"}
              </span>
            </Field>
            <Field label="Assigned projects">
              {projects.length === 0 ? (
                <span className="text-muted-foreground">None</span>
              ) : (
                <span className="flex flex-wrap gap-1.5">
                  {projects.map((project) => (
                    <span
                      key={project.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className={`size-1.5 rounded-full ${projectColorClass(project.colorToken)}`}
                      />
                      {project.name}
                    </span>
                  ))}
                </span>
              )}
            </Field>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
