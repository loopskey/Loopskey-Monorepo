"use client";

import { TDetailPrimaryActionProps } from "@/types/content-module.types";
import { getContentTypeStyle } from "@/utils/content-type-style";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const DetailPrimaryAction = ({
  primary,
  className,
  contentType,
}: TDetailPrimaryActionProps) => {
  const style = getContentTypeStyle(contentType);

  const done = Boolean(primary.done);
  const label = done ? (primary.doneLabel ?? primary.label) : primary.label;

  const content = (
    <>
      {primary.loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <Check className="h-4 w-4" />
      ) : (
        primary.icon
      )}
      {label}
    </>
  );

  if (primary.href && !done)
    return (
      <Button
        asChild
        size="lg"
        radius="xl"
        className={cn(style.solidClass, "justify-center", className)}
      >
        <a href={primary.href} target="_blank" rel="noreferrer">
          {content}
        </a>
      </Button>
    );

  return (
    <Button
      size="lg"
      radius="xl"
      type="button"
      onClick={primary.onClick}
      disabled={primary.loading || done}
      className={cn(style.solidClass, "justify-center", className)}
    >
      {content}
    </Button>
  );
};

export default DetailPrimaryAction;
