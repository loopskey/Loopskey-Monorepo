import { PASSWORD_STRENGTH_MESSAGE } from "@/utils/constant";
import { OrganizationType } from "@lib/graphql/generated";
import { z } from "zod";

export const strongPasswordSchema = z
  .string()
  .min(8, PASSWORD_STRENGTH_MESSAGE)
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, PASSWORD_STRENGTH_MESSAGE);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type TLoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type TRegisterValues = z.infer<typeof registerSchema>;

export const orgAccessRequestSchema = z.object({
  goals: z.string().trim().min(5).max(2000),
  country: z.string().trim().min(2).max(120),
  workEmail: z.string().trim().toLowerCase().email().max(255),
  organizationName: z.string().trim().min(2).max(200),
  representativeJobRole: z.string().trim().min(2).max(160),
  representativeFullName: z.string().trim().min(2).max(160),
  organizationType: z.nativeEnum(OrganizationType),
  expectedLicensedProfessionals: z.coerce.number().int().min(1),
});

export type TOrgAccessInput = z.input<typeof orgAccessRequestSchema>;
export type TOrgAccessValues = z.output<typeof orgAccessRequestSchema>;

export const otpVerificationSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Verification code must be 6 characters.")
    .max(6, "Verification code must be 6 characters."),
});

export type TOtpVerificationValues = z.infer<typeof otpVerificationSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export type TForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    code: z.string().trim().min(6).max(6),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type TResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const setOrganizationPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type TSetOrganizationPasswordValues = z.infer<
  typeof setOrganizationPasswordSchema
>;

export const mandatoryPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password you have not used for this account.",
  });

export type TMandatoryPasswordChangeValues = z.infer<
  typeof mandatoryPasswordChangeSchema
>;

export const resendActivationSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

export type TResendActivationValues = z.infer<typeof resendActivationSchema>;
