import { TRequiredMarkProps } from "@/types/element.types";

/**
 * The asterisk beside a required field's label.
 *
 * The caller supplies the translated word because an asterisk alone is read out
 * as punctuation, or skipped: the marker has to be announced as part of the
 * label for the field to be understood as required before submission.
 */
export const RequiredMark = ({ srText }: TRequiredMarkProps) => (
  <>
    <span aria-hidden className="ml-0.5 text-destructive">
      *
    </span>

    <span className="sr-only">{` (${srText})`}</span>
  </>
);
