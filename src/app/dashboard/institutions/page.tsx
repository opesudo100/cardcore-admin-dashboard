"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import CardCoreInstitutionsPage from "@/components/cardcore/institutions/page";
import CloudCardInstitutionsPage from "@/components/cloudcard/institutions/page";

export default function InstitutionsPage() {
  const { isCloudCard } = useWorkspace();
  return isCloudCard ? <CloudCardInstitutionsPage /> : <CardCoreInstitutionsPage />;
}
