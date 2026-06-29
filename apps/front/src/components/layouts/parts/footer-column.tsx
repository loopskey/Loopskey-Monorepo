import { TFooterColumn } from "@/types/element.types";

import Link from "next/link";

export const FooterColumn = ({ title, links }: TFooterColumn) => {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="
                  text-sm 
                  relative 
                  after:w-0
                  font-semibold 
                  after:h-[1px]
                  after:absolute
                  after:left-1/2
                  after:bottom-0
                  after:bg-primary
                  transition-colors 
                  hover:text-primary 
                  after:duration-300
                  hover:after:w-full
                  hover:after:left-0
                  after:transition-all
                  text-muted-foreground 
                "
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
