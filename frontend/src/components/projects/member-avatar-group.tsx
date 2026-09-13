import { TeamMemberAvatar } from "@/components/common/team-member-avatar";
import { Badge } from "@/components/ui/badge";
import { MAX_VISIBLE_MEMBERS } from "./project-options";
import type { User } from "@/types";

/** Compact avatar cluster for table cells; full names are available on hover. */
export function MemberAvatarGroup({ members }: { members: User[] }) {
  if (members.length === 0) {
    return <span className="text-xs text-muted-foreground">No members assigned</span>;
  }

  const visible = members.slice(0, MAX_VISIBLE_MEMBERS);
  const hidden = members.slice(MAX_VISIBLE_MEMBERS);

  return (
    <span className="flex items-center">
      <span className="flex -space-x-2">
        {visible.map((member) => (
          <span
            key={member.id}
            title={`${member.fullName} — ${member.jobTitle}`}
            className="rounded-full ring-2 ring-card"
          >
            <TeamMemberAvatar
              name={member.fullName}
              avatarUrl={member.avatarUrl}
              className="size-7"
            />
          </span>
        ))}
      </span>
      {hidden.length > 0 ? (
        <Badge
          variant="secondary"
          className="ml-2.5 text-[10px]"
          title={hidden.map((member) => member.fullName).join(", ")}
        >
          +{hidden.length}
        </Badge>
      ) : null}
      <span className="ml-2 hidden text-xs text-muted-foreground lg:inline">
        {members.length} {members.length === 1 ? "member" : "members"}
      </span>
    </span>
  );
}
