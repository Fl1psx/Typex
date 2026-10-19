import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-subtle",
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true">→</span> : null}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
