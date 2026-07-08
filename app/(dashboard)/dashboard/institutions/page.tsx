"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import CardCoreInstitutionsPage from "@/app/cardcore/institutions/page";
import CloudCardInstitutionsPage from "@/app/cloudcard/institutions/page";

export default function InstitutionsPage() {
  const { isCloudCard } = useWorkspace();
  return isCloudCard ? <CloudCardInstitutionsPage /> : <CardCoreInstitutionsPage />;
}
