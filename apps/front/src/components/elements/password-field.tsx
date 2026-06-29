"use client";

import { TPasswordFieldProps } from "@/types/element.types";
import { FloatingInputField } from "@elements/floating-input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FieldValues } from "react-hook-form";
import { useState } from "react";
import { Button } from "@ui/button";

export const PasswordField = <T extends FieldValues>({
  name,
  label,
  control,
  autoComplete = "current-password",
  ...props
}: TPasswordFieldProps<T>) => {
  const [visible, setVisible] = useState(false);

  return (
    <FloatingInputField
      {...props}
      name={name}
      label={label}
      control={control}
      autoComplete={autoComplete}
      type={visible ? "text" : "password"}
      leftIcon={<Lock className="h-4 w-4" />}
      rightSlot={
        <Button
          type="button"
          size="iconSm"
          radius="full"
          variant="glass"
          className="h-8 w-8"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      }
    />
  );
};
