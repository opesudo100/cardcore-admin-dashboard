export const dashboardRoutes = {
  dashboard: "/dashboard",
  institutions: "/institutions",
  cardPrograms: "/card-programs",
  cards: "/cards",
  transactions: "/transactions",
  hsm: "/hsm",
  keys: "/keys",
  users: "/users",
  billingInfo: "/billing-info",
  reports: "/reports",
  settings: "/settings",
  profile: "/profile",
} as const;

export function getSectionFromPath(pathname: string) {
  return pathname.split("/").filter(Boolean)[0] || "dashboard";
}
