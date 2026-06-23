"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { KeyService } from "@/lib/services/keyService";
import { HsmService } from "@/lib/services/hsmService";
import { InstitutionService } from "@/lib/services/institutionService";
import moment from "moment";
import Image from "next/image";
import toast from "react-hot-toast";

export default function KeyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const keyId = id as string;

  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [key, setKey] = useState<any>(null);
  const [hsms, setHsms] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const getKey = useCallback(async () => {
    setLoading(true);
    try {
      const res = await KeyService.getKey(keyId);
      if (!res.failed && res.statusCode === 200) {
        // Matching Angular logic: this.key = res.data[0];
        setKey(res.data?.[0] || res.data || null);
      } else {
        toast.error(res.message || "Failed to fetch key details");
      }
    } catch (err) {
      console.error("Error fetching key:", err);
      toast.error("An error occurred while fetching key details");
    } finally {
      setLoading(false);
    }
  }, [keyId]);

  const getData = useCallback(async () => {
    try {
      const [hsmRes, instRes] = await Promise.all([
        HsmService.getHsms(),
        InstitutionService.getInstitutions()
      ]);

      if (!hsmRes.failed) setHsms(hsmRes.data || []);
      if (!instRes.failed) setInstitutions(instRes.data || []);
    } catch (err) {
      console.error("Error fetching supporting data:", err);
    }
  }, []);

  useEffect(() => {
    if (keyId) {
      getKey();
      getData();
    }
  }, [keyId, getKey, getData]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await KeyService.deleteKey(keyId);
      if (!res.failed) {
        toast.success("Key has been deleted successfully");
        router.push("/cardcore/keys");
      } else {
        toast.error(res.message || "Failed to delete key");
      }
    } catch (err) {
      console.error("Error deleting key:", err);
      toast.error("An error occurred while deleting the key");
    } finally {
      setDeleteLoading(false);
      setIsDeleteOpen(false);
    }
  };

  const getFormattedDate = (date: string) => {
    return date ? moment(date).format("llll") : "N/A";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!key) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[400px]">
          <h2 className="text-xl font-bold text-gray-700">Key Not Found</h2>
          <button 
            onClick={() => router.push("/cardcore/keys")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Keys
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const details = [
    { label: "Key", value: key.key || "N/A" },
    { label: "KCV", value: key.kcv || "N/A" },
    { label: "HSM", value: key.hsmCode || key.hsm || "N/A" },
    { 
      label: "Status", 
      value: key.status || "inactive", 
      isBadge: true,
      badgeColor: key.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => router.push("/cardcore/keys")} 
          className="text-sm font-semibold text-gray-500 mb-8 flex flex-row gap-2 items-center hover:text-[#09245A] transition-colors group"
        >
          <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">
            <Image src={"/assets/icons/chevron-left.svg"} alt="back" width={16} height={16} />
          </div>
          <span>Back</span>
        </button>

        <div className="mb-5">
          <h1 className="text-xl font-bold text-[#091D4A]">{key.name}</h1>
          <div className="text-[14px] text-gray-500 flex flex-row items-center">
            <span>Created At:</span>
            <div className="flex flex-row gap-1.5 items-center  px-3 py-1 rounded-full">
              <Image src="/assets/icons/clock.svg" alt="clock" width={16} height={16} className="opacity-60" />
              <span className="font-medium text-gray-700">{getFormattedDate(key.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-gray-200  overflow-hidden">
          <div className="p-6 space-y-2">
            {details.map((field) => (
              <div key={field.label} className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-500 font-medium">{field.label}</span>
                {field.isBadge ? (
                  <span className={`${field.badgeColor} px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider`}>
                    {field.value}
                  </span>
                ) : (
                  <span className="font-semibold text-[#091D4A] text-sm font-mono">{field.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="bg-red-600  text-white px-10 py-3.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer "
          >
            Delete Key
          </button>
        </div>

        <DeleteModal 
          isOpen={isDeleteOpen}
          title="Delete Key"
          description={`Are you sure you want to delete "${key.name}"? This action cannot be undone and will permanently remove this key from the system.`}
          actionLabel="Delete Key"
          loading={deleteLoading}
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}
