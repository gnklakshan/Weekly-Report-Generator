import { CalendarDays, FolderKanban } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "./field-error";
import type { ReportFormValues } from "@/lib/validators";
import type { Project } from "@/types";

interface ReportHeaderSectionProps {
  projects: Project[];
  weekLabel: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

/** Report Information: the project/category and the reporting week. */
export function ReportHeaderSection({
  projects,
  weekLabel,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
}: ReportHeaderSectionProps) {
  const { control } = useFormContext<ReportFormValues>();

  return (
    <Card>
      <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FolderKanban className="size-3.5" aria-hidden="true" />
            Assigned project
          </Label>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-label="Project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError name="projectId" />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Reporting week
          </Label>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onPreviousWeek}>
              Prev
            </Button>
            <p
              aria-live="polite"
              className="flex-1 rounded-md border bg-muted/30 px-3 py-1.5 text-center text-sm font-medium"
            >
              {weekLabel}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onNextWeek}>
              Next
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCurrentWeek}>
              This week
            </Button>
          </div>
          <FieldError name="weekStart" />
        </div>
      </CardContent>
    </Card>
  );
}
