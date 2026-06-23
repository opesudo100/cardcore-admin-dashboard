"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import moment from "moment";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AddHsmKeyModal } from "@/components/dashboard/cloudcard/AddHsmKeyModal";
import { cloudCardInstitutionsService } from "@/lib/services/cloudCardInstitutionsService";
import { GeneralService } from "@/lib/services/generalService";
import { InstitutionHsmKeys } from "@/types/api";

interface CloudInstitution {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  emailAddress?: string;
  phone?: string;
  phoneNumber?: string;
  type?: string;
  walletId?: string;
  createdAt?: string;
  registrationNumber?: string;
  registrationCountry?: string;
  hsmKeys?: InstitutionHsmKeys;
}

export default function InstitutionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [institution, setInstitution] = useState<CloudInstitution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // Check if institution has any HSM keys
  const hasAnyKeys = institution?.hsmKeys && (
    institution.hsmKeys.KEK ||
    institution.hsmKeys.ZMK ||
    institution.hsmKeys.MKAC ||
    institution.hsmKeys.CVK
  );

  const getInstitution = useCallback(async () => {
    if (!id) {
      router.push("/cloudcard/institutions");
      return;
    }
    setLoading(true);
    try {
      const res = await cloudCardInstitutionsService.getInstitution(id);
      if (res.statusCode === 200 && res.data) {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setInstitution(data || null);
      } else {
        setError(res.message || "Failed to load institution details.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load details. The institution may not exist or the server is unreachable.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    getInstitution();
  }, [getInstitution]);

  const openAddKeyModal = () => {
    setModalOpen(true);
  };

  const openUpdateKeyModal = () => {
    setUpdateModalOpen(true);
  };

  const handleSaveKey = async (data: any) => {
    if (!id) {
      return { success: false, message: "Something went wrong, please try again." };
    }
    try {
      const res = await cloudCardInstitutionsService.addHsmKey(id, data);
      if (res.statusCode === 200) {
        toast.success("Key added successfully!");
        await getInstitution();
        return { success: true };
      }

      return { success: false, message: "Something went wrong, please try again." };
    } catch {
      return { success: false, message: "Something went wrong, please try again." };
    }
  };

  const getObjAsArr = (obj: any) => {
    return Object.keys(obj).map((key) => ({ key, value: obj[key] }));
  };

  const renderHsmSection = (title: string, data: any) => {
    const hasData = data && Object.values(data).some((val) => val !== null && val !== undefined && val !== "");

    return (
      <div className="border border-[#00000012] mt-4 rounded-[4px] overflow-hidden">
        <div className="h-[40px] bg-[#F9FAFB] border-b border-[#00000012] px-[10px] flex items-center justify-between">
          <span className="text-[14px] font-[600] text-[#374151]">{title}</span>
          <button
            onClick={() => openUpdateKeyModal()}
            className="text-[#374151] cursor-pointer hover:opacity-80"
          >
            <Image width={25} height={25} src="/assets/icons/update.svg" alt="edit" />
          </button>
        </div>
        {hasData ? (
          getObjAsArr(data).map(({ key, value }) => {
            if (value === null || value === undefined || value === "") return null;
            return (
              <div
                key={key}
                className="grid grid-cols-1 sm:grid-cols-12 min-h-[40px] border-b border-[#00000012] text-[14px] last:border-b-0"
              >
                <div className="sm:col-span-4 px-[10px] py-2 flex items-center text-[#6B7280] capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
                <div className="sm:col-span-8 px-[10px] py-2 flex items-center text-[#6B7280] break-all font-mono">
                  {String(value)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="min-h-[120px] flex flex-col items-center justify-center bg-gray-50/30">
            <img src="/assets/icons/empty-key.svg" alt="empty" className="w-[50px] h-[50px] opacity-40" />
            <span className="text-[14px] text-[#9CA3AF] mt-2">No {title} Key Setup</span>
          </div>
        )}
      </div>
    );
  };

  const acronym = institution ? GeneralService.getAcronym(institution.name) : "";

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col pb-16 sm:p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 text-[14px] mb-6 font-semibold w-fit transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>

        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#09245A]"></div>
            <p className="mt-4 text-[13px] font-medium text-[#6B7280]">Loading institution details...</p>
          </div>
        ) : error || !institution ? (
          <div className="flex h-96 flex-col items-center justify-center p-6 text-center border rounded-[8px] bg-white">
            <p className="text-[16px] font-semibold text-[#111827]">{error || "Institution not found"}</p>
            <button
              onClick={() => router.push("/cloudcard/institutions")}
              className="mt-4 text-sm text-[#4F46E5] hover:underline font-semibold"
            >
              Return to Institutions
            </button>
          </div>
        ) : (
          <>
            {/* Header with Add/Manage HSM Key button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start w-full mb-8">
              <div className="flex items-center gap-4">
                <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] shrink-0 bg-[#EDEEFF] flex items-center justify-center text-[22px] sm:text-[27px] font-[600] text-[#4F46E5] rounded-[4px]">
                  {acronym}
                </div>
                <div className="flex min-w-0 flex-col">
                  <h1 className="text-[22px] sm:text-[27px] font-[500] text-[#111827] break-words">
                    {institution.name}
                  </h1>
                  <span className="text-[12px] text-[#6B7280] mt-1">
                    Wallet ID: {institution.walletId || "N/A"}
                  </span>
                  <span className="text-[11px] text-[#6B7280]">
                    Created on {institution.createdAt ? moment(institution.createdAt).format("ddd, MMM DD, YYYY h:mm A") : "N/A"}
                  </span>
                </div>
              </div>
              {!hasAnyKeys && (
                <button
                  onClick={openAddKeyModal}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Image src="/assets/icons/key.svg" width={16} height={16} alt="key" />
                  Add HSM Key
                </button>
              )}
            </div>

            {/* Horizontal divider */}
            <div className="w-full h-[1px] bg-gray-200 mb-6" />

            {/* Contact info */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] text-[#374151] mb-6">
              <div className="flex min-w-0 items-center gap-2">
                <Image
                  src="/assets/icons/email.svg"
                  width={16}
                  height={16}
                  alt="email"
                  className="shrink-0"
                />
                <span className="break-all">
                  {institution.email || institution.emailAddress || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/icons/phone.svg"
                  width={16}
                  height={16}
                  alt="phone"
                  className="shrink-0"
                />
                <span>{institution.phone || institution.phoneNumber || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/icons/file.svg"
                  width={16}
                  height={16}
                  alt="file"
                  className="shrink-0"
                />
              </div>
            </div>

            {/* Description and Type table */}
            <div className="w-full max-w-[550px] border border-[#00000012] rounded-[4px] overflow-hidden mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-12 border-b min-h-[40px] text-[14px]">
                <span className="sm:col-span-4 sm:border-r px-[10px] py-2 flex items-center bg-gray-50/50 font-medium">
                  Description
                </span>
                <span className="sm:col-span-8 px-[10px] py-2 flex items-center text-[#6B7280]">
                  —
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[40px] text-[14px]">
                <span className="sm:col-span-4 sm:border-r px-[10px] py-2 flex items-center bg-gray-50/50 font-medium">
                  Type
                </span>
                <span className="sm:col-span-8 px-[10px] py-2 flex items-center uppercase text-[#6B7280] font-semibold">
                  {institution.type || "N/A"}
                </span>
              </div>
            </div>

            {/* HSM Keys Section */}
            {hasAnyKeys && (
              <div className="mt-4 max-w-[550px]">
                {renderHsmSection("KEK", institution.hsmKeys?.KEK)}
                {renderHsmSection("ZMK", institution.hsmKeys?.ZMK)}
                {renderHsmSection("MKAC", institution.hsmKeys?.MKAC)}
                {renderHsmSection("CVK", institution.hsmKeys?.CVK)}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <AddHsmKeyModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveKey}
          clientName={institution?.name || ""}
        />
        <AddHsmKeyModal
          isOpen={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          onSave={handleSaveKey}
          clientName={institution?.name || ""}
          currentData={institution?.hsmKeys}
        />
      </div>
    </DashboardLayout>
  );
}
