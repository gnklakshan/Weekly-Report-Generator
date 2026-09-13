import Link from "next/link";
import { useRouter } from "next/router";

import { navigationGroups } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  onNavigate?: () => void;
}

/** Role-aware navigation list. Items are filtered by permission, never by role. */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { hasAnyPermission } = useAuth();
  const router = useRouter();

  const groups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAnyPermission(item.permissions)),
    }))
    .filter((group) => group.items.length > 0);

  const allItems = groups.flatMap((group) => group.items);
  const activeItem = allItems
    .filter(
      (item) =>
        router.pathname === item.href ||
        (item.href !== "/" && router.pathname.startsWith(`${item.href}/`)),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          {group.items.map((item) => {
            const isActive = activeItem?.href === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
