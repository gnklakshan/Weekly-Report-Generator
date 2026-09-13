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
import { Textarea } from "@/components/ui/textarea";
import { TeamMemberAvatar } from "@/components/common/team-member-avatar";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";
import { projectFormSchema, type ProjectFormValues } from "@/lib/validators";
import { PROJECT_STATUSES } from "./project-options";
import type { Project, User } from "@/types";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` puts the dialog in create mode; a project puts it in edit mode. */
  project: Project | null;
  users: User[];
  /** Performs the mutation and reports success; throws so the dialog stays open on failure. */
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

function toFormValues(project: Project | null): ProjectFormValues {
  return {
    name: project?.name ?? "",
    description: project?.description ?? "",
    status: project?.status ?? "ACTIVE",
    memberIds: project?.memberIds ?? [],
  };
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  users,
  onSubmit,
}: ProjectFormDialogProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: toFormValues(project),
  });

  // Re-seed on every open so editing a second project never shows stale values.
  useEffect(() => {
    if (open) form.reset(toFormValues(project));
  }, [open, project, form]);

  async function handleSubmit(values: ProjectFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the project.");
    }
  }

  const isEdit = project !== null;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "Add project"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the project details and the members assigned to it."
              : "Create a project so the team can report weekly work against it."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client Portal" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="What is delivered under this project?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {PROJECT_STATUS_LABEL[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memberIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned members</FormLabel>
                  <FormControl>
                    <ScrollArea className="h-52 rounded-md border">
                      <div role="group" aria-label="Assigned members" className="space-y-0.5 p-2">
                        {users.map((user) => {
                          const checked = field.value.includes(user.id);
                          return (
                            <label
                              key={user.id}
                              htmlFor={`project-member-${user.id}`}
                              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/60"
                            >
                              <Checkbox
                                id={`project-member-${user.id}`}
                                checked={checked}
                                onCheckedChange={(next) =>
                                  field.onChange(
                                    next === true
                                      ? [...field.value, user.id]
                                      : field.value.filter((id) => id !== user.id),
                                  )
                                }
                              />
                              <TeamMemberAvatar
                                name={user.fullName}
                                avatarUrl={user.avatarUrl}
                                withName
                                jobTitle={user.jobTitle}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </FormControl>
                  <FormDescription>
                    {field.value.length} of {users.length} people selected.
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
                {isEdit ? "Save changes" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
