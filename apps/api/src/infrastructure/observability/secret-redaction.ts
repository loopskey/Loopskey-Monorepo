const SENSITIVE_KEY = /password|secret|token|authorization|cookie|api[-_]?key/i;

export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactSecrets(child),
    ]),
  );
}
