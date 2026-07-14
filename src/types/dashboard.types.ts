export type IconName =
  | "apps"
  | "building"
  | "cards"
  | "card"
  | "swap"
  | "server"
  | "key"
  | "settings"
  | "users"
  | "receipt"
  | "trend"
  | "shield"
  | "arrow"
  | "menu"
  | "eye"
  | "eye-off"
  | "back";

export type WorkspaceKey = "cardcore" | "cloudcard";

export type MenuItem = {
  label: string;
  slug: string;
  path: string;
  icon: IconName;
};

export type Metric = {
  label: string;
  value: string;
  icon: IconName;
  tint?: string;
};

export type Workspace = {
  key: WorkspaceKey;
  name: string;
  switchLabel: string;
  logo: string;
  accent: string;
  surface: string;
  active: string;
  menu: MenuItem[];
  metrics: Metric[];
};
