import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL } from "@/lib/constants";
import { userFormSchema, type UserFormValues } from "@/lib/validators";
import { projectColorClass } from "@/components/projects/project-options";
import { USER_ROLES } from "./user-options";
import type { Project, User } from "@/types";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` invites a new person; a user puts the dialog in edit mode. */
  user: User | null;
  projects: Project[];
  /** Performs the mutation and reports success; throws so the dialog stays open on failure. */
  onSubmit: (values: UserFormValues) => Promise<void>;
}

function toFormValues(user: User | null): UserFormValues {
  return {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "TEAM_MEMBER",
    jobTitle: user?.jobTitle ?? "",
    projectIds: user?.projectIds ?? [],
  };
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  projects,
  onSubmit,
}: UserFormDialogProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: toFormValues(user),
  });

  // Re-seed on every open so editing a second person never shows stale values.
  useEffect(() => {
    if (open) form.reset(toFormValues(user));
  }, [open, user, form]);

  async function handleSubmit(values: UserFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save this person.");
    }
  }

  const isEdit = user !== null;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Invite user"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this person's role, job title and project assignments."
              : "They will receive an invitation and appear with the Invited status until they accept."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex Perera" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job title</FormLabel>
                    <FormControl>
                      <Input placeholder="Backend Engineer" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="alex@example.com"
                      autoComplete="off"
                      // The mock service (and a future API) keys accounts by email, so it is immutable.
                      disabled={isEdit}
                      {...field}
                    />
                  </FormControl>
                  {isEdit ? (
                    <FormDescription>An email address cannot be changed once created.</FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Team members file reports, managers review them, admins also manage users.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projects</FormLabel>
                  <FormControl>
                    <ScrollArea className="h-44 rounded-md border">
                      <div role="group" aria-label="Project assignments" className="space-y-0.5 p-2">
                        {projects.map((project) => {
                          const checked = field.value.includes(project.id);
                          return (
                            <label
                              key={project.id}
                              htmlFor={`user-project-${project.id}`}
                              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/60"
                            >
                              <Checkbox
                                id={`user-project-${project.id}`}
                                checked={checked}
                                onCheckedChange={(next) =>
                                  field.onChange(
                                    next === true
                                      ? [...field.value, project.id]
                                      : field.value.filter((id) => id !== project.id),
                                  )
                                }
                              />
                              <span
                                aria-hidden="true"
                                className={`size-2 shrink-0 rounded-full ${projectColorClass(project.colorToken)}`}
                              />
                              <span className="min-w-0 text-sm">{project.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </FormControl>
                  <FormDescription>
                    {field.value.length} of {projects.length} projects selected.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {isEdit ? "Save changes" : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
