import { OrganizationType } from "@lib/graphql/generated";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type TLoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type TRegisterValues = z.infer<typeof registerSchema>;

export const orgAccessRequestSchema = z.object({
  goals: z.string().min(5),
  country: z.string().min(2),
  workEmail: z.string().email(),
  organizationName: z.string().min(2),
  representativeJobRole: z.string().min(2),
  representativeFullName: z.string().min(2),
  organizationType: z.nativeEnum(OrganizationType),
  expectedLicensedProfessionals: z.coerce.number().min(1),
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
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type TResetPasswordValues = z.infer<typeof resetPasswordSchema>;
