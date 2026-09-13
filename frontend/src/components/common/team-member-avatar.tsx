import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function initials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface TeamMemberAvatarProps {
  name: string;
  avatarUrl?: string;
  /** Renders the name next to the avatar; omit for avatar-only usage. */
  withName?: boolean;
  jobTitle?: string;
  className?: string;
}

export function TeamMemberAvatar({
  name,
  avatarUrl,
  withName = false,
  jobTitle,
  className,
}: TeamMemberAvatarProps) {
  const avatar = (
    <Avatar className={cn("size-8", className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
      <AvatarFallback className="bg-muted text-xs font-medium">{initials(name)}</AvatarFallback>
    </Avatar>
  );

  if (!withName) return avatar;

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {avatar}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{name}</span>
        {jobTitle ? (
          <span className="block truncate text-xs text-muted-foreground">{jobTitle}</span>
        ) : null}
      </span>
    </span>
  );
}
