import { useFormContext } from "react-hook-form";

function readError(errors: unknown, path: string[]): string | undefined {
  let node: unknown = errors;
  for (const segment of path) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  if (node === null || typeof node !== "object") return undefined;

  const entry = node as { message?: unknown; root?: { message?: unknown } };
  const message = typeof entry.message === "string" ? entry.message : entry.root?.message;
  return typeof message === "string" ? message : undefined;
}

/**
 * Renders the validation message for any field path. Needed because array rows
 * use `register` directly rather than being wrapped in a `FormField`.
 */
export function FieldError({ name }: { name: string }) {
  const { formState } = useFormContext();
  const message = readError(formState.errors, name.split("."));
  if (!message) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}
