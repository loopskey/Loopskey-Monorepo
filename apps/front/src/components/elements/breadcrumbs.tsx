import { ChevronRight } from "lucide-react";
import { localizePath } from "@/lib/i18n/locale";

import type { PublicLocale } from "@/lib/i18n/locale";
import type { Trail } from "@/lib/structured-data/trail";

import Link from "next/link";

type TBreadcrumbsProps = {
  trail: Trail;
  locale: PublicLocale;
};

const LINK_CLASS_NAME =
  "rounded-sm underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring";

const Breadcrumbs = ({ trail, locale }: TBreadcrumbsProps) => {
  const lastIndex = trail.items.length - 1;

  return (
    <nav aria-label={trail.label} className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
        {trail.items.map((item, index) => (
          <li
            key={item.path}
            className="flex min-w-0 max-w-full items-center gap-1.5"
          >
            {index === lastIndex ? (
              <span
                aria-current="page"
                className="min-w-0 break-words font-medium text-foreground"
              >
                {item.name}
              </span>
            ) : (
              <>
                <Link
                  href={localizePath(item.path, locale)}
                  className={LINK_CLASS_NAME}
                >
                  {item.name}
                </Link>
                <ChevronRight className="size-3.5 shrink-0" aria-hidden />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
