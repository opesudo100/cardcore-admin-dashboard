"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { CardProgramDetails } from "@/components/cardcore/card-programs/[id]/CardProgramDetails";
import { CardProgramService } from "@/lib/services/cardProgramService";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function CardProgramDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cardProgram, setCardProgram] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCardProgram = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await CardProgramService.getCardProgram(id);
      if (res && res.data && res.data.length > 0) {
        setCardProgram(res.data[0]);
      } else {
        toast.error("Card program not found.");
        router.push("/dashboard/card-programs");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load card program details.");
      router.push("/dashboard/card-programs");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCardProgram();
  }, [fetchCardProgram]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#09245A]" />
        <p className="mt-4 text-[13px] font-medium text-[#6B7280]">Loading card program details...</p>
      </div>
    );
  }

  if (!cardProgram) return null;

  return (
    <CardProgramDetails
      cardProgram={cardProgram}
      previousPage={() => router.push("/dashboard/card-programs")}
    />
  );
}
