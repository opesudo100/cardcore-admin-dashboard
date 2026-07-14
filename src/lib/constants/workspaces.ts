// import { dashboardRoutes } from "@/configs/routes";
// import type { Workspace, WorkspaceKey } from "@/types/dashboard.types";

// export const workspaces: Record<WorkspaceKey, Workspace> = {
//   cardcore: {
//     key: "cardcore",
//     name: "CardCore Dashboard",
//     switchLabel: "Cloud Card",
//     logo: "CardCore",
//     accent: "#09245a",
//     surface: "#eef8f5",
//     active: "#09245a",
//     menu: [
//       { label: "Dashboard", slug: "dashboard", path: dashboardRoutes.dashboard, icon: "apps" },
//       { label: "Institutions", slug: "institutions", path: dashboardRoutes.institutions, icon: "building" },
//       { label: "Card Programs", slug: "card-programs", path: dashboardRoutes.cardPrograms, icon: "cards" },
//       { label: "Cards", slug: "cards", path: dashboardRoutes.cards, icon: "card" },
//       { label: "Transactions", slug: "transactions", path: dashboardRoutes.transactions, icon: "swap" },
//       { label: "HSM", slug: "hsm", path: dashboardRoutes.hsm, icon: "server" },
//       { label: "Keys", slug: "keys", path: dashboardRoutes.keys, icon: "key" },
//       { label: "Settings", slug: "settings", path: dashboardRoutes.settings, icon: "settings" },
//     ],
//     metrics: [
//       { label: "Total Card Programs", value: "0", icon: "trend", tint: "#f1f0ff" },
//       { label: "Total Cards", value: "74", icon: "trend" },
//       { label: "Physical Cards", value: "0", icon: "card", tint: "#eff7f4" },
//       { label: "Virtual Cards", value: "74", icon: "card" },
//     ],
//   },
//   cloudcard: {
//     key: "cloudcard",
//     name: "CloudCard Dashboard",
//     switchLabel: "Card Core",
//     logo: "CloudCard",
//     accent: "#0b316a",
//     surface: "#f1fbf8",
//     active: "#0b316a",
//     menu: [
//       { label: "Dashboard", slug: "dashboard", path: dashboardRoutes.dashboard, icon: "apps" },
//       { label: "Institutions", slug: "institutions", path: dashboardRoutes.institutions, icon: "building" },
//       { label: "Users", slug: "users", path: dashboardRoutes.users, icon: "users" },
//       { label: "Billing Info", slug: "billing-info", path: dashboardRoutes.billingInfo, icon: "receipt" },
//       { label: "Settings", slug: "settings", path: dashboardRoutes.settings, icon: "settings" },
//     ],
//     metrics: [
//       { label: "Total Institutions", value: "135", icon: "trend", tint: "#f1f0ff" },
//       { label: "Total Cards", value: "89", icon: "trend" },
//       { label: "Completed Payments", value: "0%", icon: "receipt", tint: "#eefaf6" },
//       { label: "Pending Payments", value: "0%", icon: "receipt" },
//     ],
//   },
// };

// export const recentClients = [
//   "Acme Inc One",
//   "Acme Inc Two",
//   "Acme Inc",
//   "Acme Inc Three",
//   "Tekspace Corp",
//   "Test Corp",
// ];

// export function getNextWorkspace(workspace: WorkspaceKey): WorkspaceKey {
//   return workspace === "cardcore" ? "cloudcard" : "cardcore";
// }
