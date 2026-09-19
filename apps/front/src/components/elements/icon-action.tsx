"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { TIconActionProps } from "@/types/element.types";
import { Button } from "@ui/button";

import Link from "next/link";

export const IconAction = ({
  rel,
  href,
  label,
  target,
  onClick,
  disabled,
  icon: Icon,
  variant = "outline",
}: TIconActionProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        radius="full"
        size="iconSm"
        type={href ? undefined : "button"}
        variant={variant}
        onClick={href ? undefined : onClick}
        aria-label={label}
        disabled={href ? undefined : disabled}
        asChild={Boolean(href)}
        className="focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
      >
        {href ? (
          <Link href={href} target={target} rel={rel}>
            <Icon className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <Icon className="h-4 w-4" aria-hidden />
        )}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);
