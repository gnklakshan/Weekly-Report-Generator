import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * Labelled dropdown used by the dashboard filters. Generic over the value
 * union so callers keep full type-safety (e.g. report status + "ALL").
 */
export function FilterSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}: FilterSelectProps<T>) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </Label>
      <Select value={value} onValueChange={(next) => onChange(next as T)} disabled={disabled}>
        <SelectTrigger id={id} className="h-9 w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-sm">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
