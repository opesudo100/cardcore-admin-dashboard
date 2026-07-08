"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import CardCoreSettingsPage from "@/app/cardcore/settings/page";
import CloudCardSettingsPage from "@/app/cloudcard/settings/page";

export default function SettingsPage() {
  const { isCloudCard } = useWorkspace();
  return isCloudCard ? <CloudCardSettingsPage /> : <CardCoreSettingsPage />;
}
