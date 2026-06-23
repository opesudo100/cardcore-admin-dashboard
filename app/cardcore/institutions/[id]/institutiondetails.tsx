"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import moment from "moment";
import { InstitutionService } from "@/lib/services/institutionService";
import Toggle from "@/components/ui/Toggle";
import { toast } from "react-hot-toast";

interface Institution {
    id: string;
    _id?: string;
    name: string;
    emailAddress: string; 
    code: string;
    status: string;
    createdAt?: string;
    phoneNumber: string; 
    websiteUrl: string;  
    address: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        _id?: string;
    } | string;
}

interface InstitutionDetailsProps {
    institution: Institution;
    onBack: () => void;
    onStatusUpdate?: (id: string, nextStatus: string) => void;
}

export default function InstitutionDetails({ institution: initialInstitution, onBack, onStatusUpdate }: InstitutionDetailsProps) {
    const [activeTab, setActiveTab] = useState<"basic" | "team">("basic");
    const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
    
    const [institution, setInstitution] = useState<Institution>(initialInstitution);
    const [status, setStatus] = useState<string>(initialInstitution.status || "active");
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);

    const orgId = initialInstitution.id || initialInstitution._id || "";

    const fetchInstitutionDetails = useCallback(async () => {
        if (!orgId) return;
        setLoadingInfo(true);
        try {
            const res = await InstitutionService.getInstitution(orgId);
            if (res && res.data && res.data.length > 0) {
                const freshData = res.data[0];
                setInstitution(freshData);
                setStatus(freshData.status);
            }
        } catch (err) {
            console.error("Failed to fetch institution details", err);
        } finally {
            setLoadingInfo(false);
        }
    }, [orgId]);

    const fetchTeamMembers = useCallback(async () => {
        if (!orgId) return;
        setLoadingTeam(true);
        try {
            const res = await InstitutionService.getTeamMembers(orgId);
            if (res && res.data) {
                setTeamMembers(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch team members", err);
        } finally {
            setLoadingTeam(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchInstitutionDetails();
        fetchTeamMembers();
    }, [fetchInstitutionDetails, fetchTeamMembers]);

    const handleToggleStatus = async () => {
        const isCurrentlyActive = status === "active";
        const nextStatusStr = isCurrentlyActive ? "inactive" : "active";
        
        setLoadingStatus(true);
        
        try {
            console.log(`Dispatched status alteration payload: ${nextStatusStr}`);
            const res = await InstitutionService.updateInstitutionStatus(orgId, nextStatusStr);
            
            if (res && (res.statusCode === 200 || res.success || !res.failed)) {
                setStatus(nextStatusStr);
                toast.success(`Institution is now ${nextStatusStr}`);
                
                // Fire state sync hooks to match table mutations in real-time
                if (onStatusUpdate) {
                    onStatusUpdate(orgId, nextStatusStr);
                }
                
                await fetchInstitutionDetails();
            } else {
                toast.error(res?.message || "Server rejected status parameter update configuration.");
            }
        } catch (err) {
            console.error("Toggle execution failed:", err);
            toast.error("Network Error: Verification failed to reach api server gateway.");
        } finally {
            setLoadingStatus(false);
          }
    };

    const handleReset2FA = async (userId: string) => {
        try {
            const res = await InstitutionService.reset2fa(userId);
            if (res && !res.failed) {
                toast.success("Successfully reset 2FA");
                fetchTeamMembers(); 
            } else {
                toast.error("Failed to reset 2FA");
            }
        } catch (err) {
            toast.error("Failed to reset 2FA");
        } finally {
            setActiveMenuIndex(null);
        }
    };

    return (
        <div className="w-full flex flex-col rounded-[8px] sm:p-6 min-h-[calc(100vh-120px)] animate-in fade-in duration-200">

            {/* Back Navigation Trigger Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 text-[14px] mb-6 font-semibold w-fit transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back 
            </button>

            {/* Identity Banner Block */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start w-full mb-8">
                <div className="min-w-0">
                    <h1 className="text-[22px] sm:text-[28px] font-bold text-gray-900 break-words">{institution.name}</h1>
                    <div className="text-[13px] sm:text-[14px] text-gray-700 mt-1 flex flex-wrap gap-1">
                        <p>Created At: </p>
                        <Image src="/assets/icons/clock.svg" alt="" width={15} height={15} />
                        <span className="break-words">
                            {institution.createdAt ? moment(institution.createdAt).format('llll') : '---'}
                        </span>
                    </div>
                </div>

                <div className="border border-gray-100 rounded-[8px] p-3 flex flex-col items-center min-w-[90px]">
                    <Toggle active={status === "active"} disabled={loadingStatus} onToggle={handleToggleStatus} />
                    <span className="text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-wide select-none">
                        {status}
                    </span>
                </div>
            </div>

            {/* Inner Navigation Tabs */}
            <div className="flex gap-6 sm:gap-8 overflow-x-auto border-b border-gray-100 mb-8 text-[15px]">
                <button
                    onClick={() => setActiveTab("basic")}
                    className={`pb-3 font-bold transition-all ${activeTab === "basic" ? "border-b-2 border-[#091D4A] text-[#091D4A]" : "text-gray-400"}`}
                >
                    Basic Info
                </button>
                <button
                    onClick={() => setActiveTab("team")}
                    className={`pb-3 font-bold transition-all ${activeTab === "team" ? "border-b-2 border-[#091D4A] text-[#091D4A]" : "text-gray-400"}`}
                >
                    Team Members
                </button>
            </div>

            {/* Tab Panes Panel Views */}
            {activeTab === "basic" ? (
                loadingInfo ? (
                    <div className="w-full py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#09245A]" /></div>
                ) : (
                    <div className="bg-[#edeeff3a] rounded-[8px] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 ">
                        <div>
                            <h3 className="text-[18px] font-bold text-gray-900">Basic Information</h3>
                            <p className="text-[14px] text-gray-400 mt-0.5">Basic profile details registry</p>
                        </div>
                        <div className="flex flex-col gap-5 text-[15px] text-gray-700 font-medium mt-2">
                            {/* Code Row */}
                            <div className="flex items-start sm:items-center gap-4">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    <Image src="/assets/icons/globe.svg" alt="Code" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-gray-600 font-semibold">{institution.code || "---"}</span>
                            </div>
                            
                            {/* Website Row */}
                            <div className="flex items-center gap-4">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    <Image src="/assets/icons/globe.svg" alt="Website" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-gray-600 font-normal break-all hover:underline cursor-pointer hover:text-blue-400 transition-all duration-200">
                                    {institution.websiteUrl || "No website provided"}
                                </span>
                            </div>
                            
                            {/* Email Row */}
                            <div className="flex items-center gap-4">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    <Image src="/assets/icons/email.svg" alt="Email" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-gray-600  break-all">
                                    {/* Swapped out emailAddress for institutionEmail key */}
                                    {institution.emailAddress || "---"}
                                </span>
                            </div>
                            
                            {/* Phone Row */}
                            <div className="flex items-start sm:items-center gap-4">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    <Image src="/assets/icons/phone.svg" alt="Phone" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-gray-600 ">
                                    {/* Swapped out phoneNumber for institutionPhone key */}
                                    {institution.phoneNumber || "No phone record"}
                                </span>
                            </div>
                            
                            {/* Address Row */}
                            <div className="flex items-center gap-4">
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    <Image src="/assets/icons/location.svg" alt="Address" width={20} height={20} className="object-contain" />
                                </div>
                                <span className="text-gray-600 font-normal leading-relaxed break-words">
                                    {typeof institution.address === "object" && institution.address
                                        ? [institution.address.street, institution.address.city, institution.address.state, institution.address.country].filter(Boolean).join(", ")
                                        : institution.address || "No address provided"}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-[18px] font-bold text-gray-900">Team Members</h3>
                        <p className="text-[13px] text-gray-400 mt-0.5">Showing users attached to this account</p>
                    </div>

                    {loadingTeam ? (
                        <div className="w-full py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#09245A]" /></div>
                    ) : teamMembers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No team members attached to this institution.</div>
                    ) : (
                        <div className="responsive-table overflow-visible rounded-[6px]">
                            <table className="w-full min-w-[640px] text-left border-collapse table-auto">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Users</th>
                                        <th className="py-3.5 px-6">Role</th>
                                        <th className="py-3.5 px-6">Status</th>
                                        <th className="py-3.5 px-6"></th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 text-[14px]">
                                    {teamMembers.map((member, i) => {
                                        const membership = member?.memberships?.[0];
                                        const rawRoleName = membership?.roles?.[0]?.role || "USER";
                                        const cleanRoleDisplay = rawRoleName.replace("_", " ");

                                        return (
                                            <tr key={member.id || member._id || i} className="hover:bg-slate-50/40 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900">
                                                            {member.name || `${member.firstName || ''} ${member.lastName || ''}`}
                                                        </span>
                                                        <span className="text-[12px] text-gray-400 font-normal">
                                                            {member.emailAddress || "---"}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                <td className="py-4 px-6 text-gray-600 text-[13px] font-semibold tracking-wide uppercase">
                                                    {cleanRoleDisplay}
                                                </td>
                                                
                                                <td className="py-4 px-6">
                                                    <span className="text-gray-600 font-medium text-[14px] capitalize">{member.status}</span>
                                                </td>

                                                <td className="py-4 px-6 text-right pr-8 shrink-0 relative overflow-visible">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuIndex(activeMenuIndex === i ? null : i);
                                                        }}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 active:bg-gray-200/80 transition-colors cursor-pointer ml-auto"
                                                    >
                                                        <Image src="/assets/icons/more.svg" alt="More Options" width={25} height={25} className="object-contain opacity-60 hover:opacity-90 transition-opacity" />
                                                    </button>

                                                    {activeMenuIndex === i && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuIndex(null)} />
                                                            <div className="absolute right-8 top-12 w-[200px] bg-white rounded-[6px] border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.06)] z-20 overflow-hidden text-left">
                                                                <button
                                                                    onClick={() => handleReset2FA(member.id || member._id)}
                                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#1F2937] hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150"
                                                                >
                                                                    <Image src="/assets/icons/disable.svg" alt="Disable" width={16} height={16} className="object-contain" />
                                                                    <span className="text-[14px] font-bold text-[#1F2937] tracking-tight">Disable 2FA</span>
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}