"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import CloudCardInstitutionDetailsPage from "@/app/cloudcard/institutions/[id]/page";
import CardCoreInstitutionDetailsPage from "@/app/cardcore/institutions/[id]/institutiondetails";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InstitutionService } from "@/lib/services/institutionService";

// CloudCard uses a real URL-based detail page, but CardCore uses an inline component
// We render the correct one based on workspace
export default function InstitutionDetailsPage() {
  const { isCloudCard } = useWorkspace();

  if (isCloudCard) {
    return <CloudCardInstitutionDetailsPage />;
  }

  return <CardCoreInstitutionDetailsWrapper />;
}

function CardCoreInstitutionDetailsWrapper() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [institution, setInstitution] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInstitution = useCallback(async () => {
    if (!id) {
      router.push("/dashboard/institutions");
      return;
    }
    setLoading(true);
    try {
      const res = await InstitutionService.getInstitution(id);
      if (res && res.data && res.data.length > 0) {
        setInstitution(res.data[0]);
      } else {
        setError("Institution not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load institution details.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchInstitution();
  }, [fetchInstitution]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#09245A]" />
          <p className="mt-4 text-[13px] font-medium text-[#6B7280]">Loading institution details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !institution) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center p-6 text-center border rounded-[8px] bg-white">
          <p className="text-[16px] font-semibold text-[#111827]">{error || "Institution not found"}</p>
          <button
            onClick={() => router.push("/dashboard/institutions")}
            className="mt-4 text-sm text-[#4F46E5] hover:underline font-semibold"
          >
            Return to Institutions
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <CardCoreInstitutionDetailsPage
        institution={institution}
        onBack={() => router.push("/dashboard/institutions")}
        onStatusUpdate={undefined}
      />
    </DashboardLayout>
  );
}
