import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { LogOut, Menu, NotebookPen, Search, Sparkles } from "lucide-react";

import { SidebarNav } from "./sidebar-nav";
import { NotificationMenu } from "./notification-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AIAssistantModal } from "@/components/common/ai-assistant-modal";
import { initials } from "@/components/common/team-member-avatar";
import { APP_NAME, ROLE_LABEL } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";

function Brand() {
  return (
    <div className="flex h-16 items-center gap-2 border-b px-5">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <NotebookPen className="size-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  async function handleLogout() {
    await logout();
    void router.replace("/login");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    void router.push({ pathname: "/reports", query: { search: term } });
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card lg:flex">
        <Brand />
        <SidebarNav />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 items-center">
            <form onSubmit={handleSearch} className="relative hidden w-full max-w-sm md:block">
              <label htmlFor="global-search" className="sr-only">
                Search reports
              </label>
              <Search
                className="absolute left-3 top-2.5 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="global-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search reports…"
                className="h-9 pl-9 text-sm"
              />
            </form>
            <div className="min-w-0 md:hidden">
              <p className="truncate text-sm font-semibold">
                {user ? `Welcome back, ${user.fullName.split(" ")[0]}` : APP_NAME}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.jobTitle ?? "Team reporting workspace"}
              </p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden lg:inline-flex">
                {ROLE_LABEL[user.role]}
              </Badge>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    aria-label="Open AI reporting assistant"
                    onClick={() => setAssistantOpen(true)}
                  >
                    <Sparkles className="size-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">AI assistant (demo)</TooltipContent>
              </Tooltip>

              <NotificationMenu />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="size-9 rounded-full p-0" aria-label="Account">
                    <Avatar className="size-9">
                      <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="block text-sm font-medium">{user.fullName}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void handleLogout()}>
                    <LogOut className="mr-2 size-4" aria-hidden="true" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <AIAssistantModal open={assistantOpen} onOpenChange={setAssistantOpen} />
    </div>
  );
}
