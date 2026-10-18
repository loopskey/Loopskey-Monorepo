export const isValidHref = (href: unknown): href is string =>
  typeof href === "string" && href.trim().length > 0;

export const normalizePath = (path: string) => {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "");
};
