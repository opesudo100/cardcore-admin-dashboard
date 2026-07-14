"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import CardCoreSettingsPage from "@/components/cardcore/settings/page";
import CloudCardSettingsPage from "@/components/cloudcard/settings/page";

export default function SettingsPage() {
  const { isCloudCard } = useWorkspace();
  return isCloudCard ? <CloudCardSettingsPage /> : <CardCoreSettingsPage />;
}
