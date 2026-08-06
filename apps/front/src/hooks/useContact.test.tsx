// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const submitMutation = vi.fn();
const notifySuccess = vi.fn();
const notifyError = vi.fn();

vi.mock("@/lib/rtk/endpoints/support.api", () => ({
  useSubmitContactInquiryMutation: () => [
    submitMutation,
    { isLoading: false },
  ],
}));

vi.mock("@/hooks/notify", () => ({
  notify: {
    success: (...args: unknown[]) => notifySuccess(...args),
    error: (...args: unknown[]) => notifyError(...args),
  },
}));

vi.mock("@/hooks/useI18n", () => ({
  useI18n: () => ({
    t: (key: string, _params?: unknown, fallback = "") => fallback || key,
  }),
}));

import { useContactPage } from "@/hooks/useContact";
import { ContactInquiryType } from "@lib/graphql/generated";

const validValues = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  organization: "",
  inquiryType: ContactInquiryType.TechnicalSupport,
  message: "I cannot export my CPD record for this quarter.",
};

const fillAndSubmit = async (
  result: { current: ReturnType<typeof useContactPage> },
  overrides: Partial<typeof validValues> = {},
) => {
  const values = { ...validValues, ...overrides };
  act(() => {
    for (const [key, value] of Object.entries(values)) {
      result.current.form.setValue(
        key as keyof typeof values,
        value as never,
        { shouldValidate: true },
      );
    }
  });
  await act(async () => {
    await result.current.submitContactForm();
  });
};

describe("useContactPage", () => {
  beforeEach(() => {
    submitMutation.mockReset();
    notifySuccess.mockReset();
    notifyError.mockReset();
    submitMutation.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true, code: "OK", referenceId: "r1" }),
    });
  });

  afterEach(cleanup);

  it("offers every approved inquiry type", () => {
    const { result } = renderHook(() => useContactPage());
    expect(result.current.inquiryTypeOptions).toHaveLength(11);
    expect(result.current.inquiryTypeOptions.map((o) => o.value)).toContain(
      ContactInquiryType.SecurityConcern,
    );
  });

  it("submits an accepted inquiry and resets the form", async () => {
    const { result } = renderHook(() => useContactPage());
    await fillAndSubmit(result);

    expect(submitMutation).toHaveBeenCalledTimes(1);
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(result.current.form.getValues("message")).toBe("");
    });
  });

  it("omits a blank organization and sends a trimmed one", async () => {
    const { result } = renderHook(() => useContactPage());

    await fillAndSubmit(result, { organization: "   " });
    expect(submitMutation.mock.calls[0][0].organization).toBeUndefined();

    await fillAndSubmit(result, { organization: "  INCOSE  " });
    expect(submitMutation.mock.calls[1][0].organization).toBe("INCOSE");
  });

  it("does not report success or reset when the backend rejects delivery", async () => {
    submitMutation.mockReturnValue({
      unwrap: () => Promise.reject({ errors: [{ extensions: { code: "CONTACT_INQUIRY_DELIVERY_FAILED" } }] }),
    });
    const { result } = renderHook(() => useContactPage());

    await fillAndSubmit(result);

    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    // Entered values survive so the visitor can retry without retyping.
    expect(result.current.form.getValues("message")).toBe(validValues.message);
    expect(result.current.form.getValues("fullName")).toBe(validValues.fullName);
  });

  it("surfaces a distinct message when the caller is rate limited", async () => {
    submitMutation.mockReturnValue({
      unwrap: () => Promise.reject({ errors: [{ extensions: { code: "CONTACT_INQUIRY_RATE_LIMITED" } }] }),
    });
    const { result } = renderHook(() => useContactPage());

    await fillAndSubmit(result);

    await waitFor(() => {
      expect(result.current.submitError).toMatch(/too many messages/i);
    });
  });

  it("exposes the direct contact address as a failure fallback", () => {
    const { result } = renderHook(() => useContactPage());
    expect(result.current.fallbackEmail).toBe("loopskey.dev@gmail.com");
  });

  it("treats an unsuccessful payload as a failure rather than a success", async () => {
    submitMutation.mockReturnValue({
      unwrap: () => Promise.resolve({ success: false, code: "NOPE" }),
    });
    const { result } = renderHook(() => useContactPage());

    await fillAndSubmit(result);

    expect(notifySuccess).not.toHaveBeenCalled();
    expect(result.current.form.getValues("message")).toBe(validValues.message);
  });

  it("reuses one idempotency key across retries and rotates it after success", async () => {
    submitMutation.mockReturnValue({
      unwrap: () => Promise.reject({ errors: [{ extensions: { code: "CONTACT_INQUIRY_DELIVERY_FAILED" } }] }),
    });
    const { result } = renderHook(() => useContactPage());

    await fillAndSubmit(result);
    await fillAndSubmit(result);

    const firstKey = submitMutation.mock.calls[0][0].idempotencyKey;
    const retryKey = submitMutation.mock.calls[1][0].idempotencyKey;
    expect(retryKey).toBe(firstKey);

    submitMutation.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true, code: "OK" }),
    });
    await fillAndSubmit(result);
    await fillAndSubmit(result);

    const afterSuccessKey = submitMutation.mock.calls[3][0].idempotencyKey;
    expect(afterSuccessKey).not.toBe(firstKey);
  });

  it("does not submit when required fields are invalid", async () => {
    const { result } = renderHook(() => useContactPage());

    await fillAndSubmit(result, { email: "not-an-email", message: "too short" });

    expect(submitMutation).not.toHaveBeenCalled();
  });
});
