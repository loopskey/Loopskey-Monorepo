import { ValidationOptions, registerDecorator } from "class-validator";

type TIntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (key: "timeZone") => string[];
};

const intl = Intl as TIntlWithSupportedValues;

export const SUPPORTED_TIME_ZONES: string[] =
  typeof intl.supportedValuesOf === "function"
    ? intl.supportedValuesOf("timeZone")
    : [];

export const isSupportedTimeZone = (value: unknown): value is string => {
  if (typeof value !== "string" || value.trim().length === 0) return false;
  if (SUPPORTED_TIME_ZONES.length > 0)
    return SUPPORTED_TIME_ZONES.includes(value);
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const IsTimeZone = (options?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isTimeZone",
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} must be a valid IANA time zone.`,
        ...options,
      },
      validator: { validate: (value: unknown) => isSupportedTimeZone(value) },
    });
  };
};
