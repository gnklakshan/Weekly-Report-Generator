import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className="mb-2">
      <BreadcrumbList className="text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <BreadcrumbItem key={`${item.label}-${index}`}>
              {isLast || !item.href ? (
                <BreadcrumbPage className="text-xs">{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild className="text-xs">
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
              {isLast ? null : <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
