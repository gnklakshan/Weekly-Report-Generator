import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { PlannedTask, ReportTask } from "@/types";
import { PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/constants";

interface TaskTableReadOnlyProps {
  tasks: ReportTask[];
}

export function TaskTableReadOnly({ tasks }: TaskTableReadOnlyProps) {
  if (tasks.length === 0) {
    return <p className="text-xs text-muted-foreground italic py-2">No completed tasks recorded.</p>;
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 text-xs">
            <TableHead className="w-[30%]">Task Title / Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Planned / Actual %</TableHead>
            <TableHead>Hours (Est/Spent)</TableHead>
            <TableHead>Deliverable / Output</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="text-xs">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {PRIORITY_LABEL[task.priority]}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-[11px] font-medium text-foreground">
                  {TASK_STATUS_LABEL[task.status]}
                </span>
              </TableCell>
              <TableCell>
                <div className="space-y-1 w-28">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{task.actualPercent}%</span>
                    <span>Target {task.plannedPercent}%</span>
                  </div>
                  <Progress value={task.actualPercent} className="h-1.5" />
                </div>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {task.plannedHours}h / <span className="font-semibold text-foreground">{task.spentHours}h</span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.output ? (
                  <span className="truncate max-w-[200px] block" title={task.output}>
                    {task.output}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PlannedTaskTableReadOnly({ tasks }: { tasks: PlannedTask[] }) {
  if (tasks.length === 0) {
    return <p className="text-xs text-muted-foreground italic py-2">No planned tasks for next week.</p>;
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 text-xs">
            <TableHead className="w-[60%]">Planned Task Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Est. Hours</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, i) => (
            <TableRow key={task.id || i} className="text-xs">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">
                  {PRIORITY_LABEL[task.priority]}
                </Badge>
              </TableCell>
              <TableCell className="font-mono font-medium">{task.plannedHours} hrs</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
