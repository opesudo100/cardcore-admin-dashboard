"use client";

import { InviteUserModal } from "@/components/modals/InviteUserModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { EllipsisVertical, UserX, UserCheck, ShieldAlert, Mail, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { AuthService } from "@/lib/services/authService";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

type UserRole = {
  role?: string;
  permissions?: string[];
};

type UserMembership = {
  isPrimary?: boolean;
  roles?: UserRole[];
};

type ManagedUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  email?: string;
  status?: string;
  twoFactorAuthEnabled?: boolean;
  membership?: UserMembership;
  memberships?: UserMembership[];
};

export const ManageUsersTab = () => {
  const [inviteModal, setInviteModal] = useState(false);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<ManagedUser | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showOptionId, setShowOptionId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const optionsRef = useRef<HTMLDivElement>(null);

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AuthService.getAllUsers();
      if (res.statusCode === 200) {
        setUsers(res.data || []);
        setTotal(res.pagination?.total || (res.data?.length || 0));
      } else {
        toast.error(res.message || "Failed to fetch users");
      }
    } catch {
      toast.error("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void getAllUsers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [getAllUsers]);

  // Handle click outside to close options menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStatus = async (user: ManagedUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    setActionLoading(user._id);
    try {
      const res = await AuthService.updateAdminUser(user._id, { status: newStatus });
      if (res.statusCode === 200) {
        toast.success(`User ${newStatus === "active" ? "enabled" : "disabled"} successfully`);
        getAllUsers();
      } else {
        toast.error(res.message || "Failed to update user status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
      setShowOptionId(null);
    }
  };

  const blockUser = async (user: ManagedUser) => {
    const status = user.status || "";
    const newStatus = ["blocked", "suspended", "inactive"].includes(status) ? "active" : "suspended";
    setActionLoading(user._id);
    try {
      const res = await AuthService.updateAdminUser(user._id, { status: newStatus });
      if (res.statusCode === 200) {
        toast.success(`User ${newStatus === "suspended" ? "blocked" : "activated"} successfully`);
        getAllUsers();
      } else {
        toast.error(res.message || "Failed to update user status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
      setShowOptionId(null);
    }
  };

  const toggleTwoFactor = async (user: ManagedUser) => {
    setActionLoading(user._id);
    try {
      const res = await AuthService.updateAdminUser(user._id, {
        twoFactorAuthEnabled: !user.twoFactorAuthEnabled,
      });
      if (res.statusCode === 200) {
        toast.success(`2FA ${user.twoFactorAuthEnabled ? "disabled" : "enabled"} successfully`);
        getAllUsers();
      } else {
        toast.error(res.message || "Failed to update 2FA");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
      setShowOptionId(null);
    }
  };

  const resendInvitation = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await AuthService.resendInvite(userId);
      if (res.statusCode === 200) {
        toast.success("Invitation resent successfully");
      } else {
        toast.error(res.message || "Failed to resend invitation");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
      setShowOptionId(null);
    }
  };

  const deleteAdminUser = async () => {
    if (!deleteUser) return;

    setActionLoading(deleteUser._id);
    try {
      const res = await AuthService.deleteAdminUser(deleteUser._id);
      if (res.statusCode === 200 || res.statusCode === 204) {
        toast.success("User deleted successfully");
        setDeleteUser(null);
        getAllUsers();
      } else {
        toast.error(res.message || "Failed to delete user");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700";
      case "inactive": return "bg-gray-100 text-gray-700";
      case "blocked": return "bg-red-100 text-red-700";
      case "suspended": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getMembership = (user: ManagedUser) => user.membership || user.memberships?.[0] || {};
  const getRole = (user: ManagedUser) => getMembership(user).roles?.[0] || {};
  const getRoleLabel = (user: ManagedUser) => (getRole(user).role || "ADMIN_USER").replaceAll("_", " ").toLowerCase();
  const getPermissionsCount = (user: ManagedUser) => getRole(user).permissions?.length || 0;
  const canManageUser = (user: ManagedUser) => {
    const roleLabel = getRoleLabel(user);
    return (
      (roleLabel === "super admin" && !getMembership(user)?.isPrimary) ||
      roleLabel === "admin user" ||
      user.status === "pending"
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 py-4 animate-in fade-in duration-500">
      {/* TOP */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[15px] text-gray-500 font-medium">
          {loading ? (
            <LoadingContent label="" spinnerClassName="h-4 w-4 border-[#09245A]/20 border-t-[#09245A]" />
          ) : `${total} results found`}
        </span>

        <button
          onClick={() => setInviteModal(true)}
          className="h-[40px] w-fit px-5 border border-[#091D4A] rounded-[8px] text-gray-700 text-[14px] font-[600] cursor-pointer sm:h-[44px] sm:px-8"
        >
          Add New User
        </button>
      </div>

      {/* TABLE */}
      <div className="responsive-table bg-white rounded-[5px] shadow-sm">
        {/* HEADER */}
        <div className="cardcore-table-header flex items-center justify-between px-3 uppercase tracking-wider sm:px-6">
          <div className="min-w-0 flex-1 sm:w-[50%] sm:flex-none">User Details</div>
          <div className="hidden sm:block sm:w-[25%]">Role</div>
          <div className="hidden sm:block sm:w-[17%]">Status</div>
          <div className="w-[44px] shrink-0"></div>
        </div>

        {/* BODY */}
        <div className="w-full divide-y divide-gray-300">
          {loading ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#09245A]"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-400">
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Add a new user to get started</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="cardcore-table-row flex min-h-[86px] items-center justify-between gap-3 px-3 hover:bg-[#F9FAFB] transition-colors sm:px-6"
              >
                {/* USER */}
                <div className="min-w-0 flex flex-1 items-center gap-3 sm:w-[50%] sm:flex-none sm:gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#091D4A] font-bold text-[14px]">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[14px] font-[700] text-[#111827] sm:text-[15px]">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="truncate text-[12px] text-gray-500 sm:text-[13px]">
                      {user.emailAddress || user.email}
                    </span>
                    <span className="mt-1 text-[11px] font-[600] capitalize text-[#091D4A] sm:hidden">
                      {getRoleLabel(user)}
                    </span>
                    <span className={`mt-1 w-fit px-2 py-0.5 rounded text-[9px] font-[700] uppercase tracking-wide sm:hidden ${getStatusColor(user.status || "")}`}>
                      {user.status || "inactive"}
                    </span>
                  </div>
                </div>

                {/* ROLE */}
                <div className="hidden flex-col gap-1 sm:flex sm:w-[25%]">
                  <span className="text-[14px] font-[600] text-[#091D4A]">
                    {getRoleLabel(user)}
                  </span>
                  <span className="text-[11px] text-gray-400 truncate max-w-[150px]">
                    {getPermissionsCount(user)} permissions assigned
                  </span>
                </div>

                {/* STATUS */}
                <div className="hidden sm:block sm:w-[17%]">
                  <span className={`px-3 py-1 rounded text-[11px] font-[700] uppercase tracking-wide ${getStatusColor(user.status || "")}`}>
                    {user.status || "inactive"}
                  </span>
                </div>

                {/* ACTION */}
                <div className="relative flex w-[44px] shrink-0 justify-end">
                  {canManageUser(user) && <button 
                    onClick={() => setShowOptionId(showOptionId === user._id ? null : user._id)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                    {actionLoading === user._id ? (
                      <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <EllipsisVertical size={20} />
                    )}
                  </button>}

                  {showOptionId === user._id && (
                    <div 
                      ref={optionsRef}
                      className="absolute right-0 top-10 w-[min(200px,calc(100vw-32px))] bg-white border border-[#E5E7EB] rounded-[8px] shadow-lg z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100"
                    >
                      {(getRoleLabel(user) === "super admin" || getRoleLabel(user) === "admin user") && (
                        <button
                          onClick={() => {
                            setEditUser(user);
                            setShowOptionId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={16} className="text-gray-500" />
                          Edit User
                        </button>
                      )}

                      <button 
                        onClick={() => toggleStatus(user)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={Boolean(actionLoading)}
                      >
                        {user.status === "active" ? (
                          <><UserX size={16} className="text-red-500" /> Disable User</>
                        ) : (
                          <><UserCheck size={16} className="text-green-500" /> Enable User</>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => blockUser(user)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={Boolean(actionLoading)}
                      >
                        <ShieldAlert size={16} className="text-orange-500" />
                        {["blocked", "suspended", "inactive"].includes(user.status || "") ? "Activate User" : "Block User"}
                      </button>

                      {user.status === "active" && (
                        <button
                          onClick={() => toggleTwoFactor(user)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                          disabled={Boolean(actionLoading)}
                        >
                          <ShieldCheck size={16} className="text-indigo-500" />
                          {user.twoFactorAuthEnabled ? "Disable" : "Enable"} 2FA
                        </button>
                      )}

                      {user.status === "pending" && (
                        <button
                          onClick={() => resendInvitation(user._id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                          disabled={Boolean(actionLoading)}
                        >
                          <Mail size={16} className="text-blue-500" />
                          Resend Invitation
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDeleteUser(user);
                          setShowOptionId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                        disabled={Boolean(actionLoading)}
                      >
                        <Trash2 size={16} />
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {inviteModal && (
        <InviteUserModal
          isOpen={inviteModal}
          onClose={() => {
            setInviteModal(false);
            getAllUsers();
          }}
        />
      )}
      {editUser && (
        <InviteUserModal
          isOpen={Boolean(editUser)}
          mode="edit"
          user={editUser}
          onClose={() => {
            setEditUser(null);
            getAllUsers();
          }}
        />
      )}
      <DeleteModal
        isOpen={Boolean(deleteUser)}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteUser?.firstName || "this"} ${deleteUser?.lastName || "user"}? This action cannot be undone.`}
        actionLabel="Delete User"
        loading={actionLoading === deleteUser?._id}
        onCancel={() => {
          if (!actionLoading) setDeleteUser(null);
        }}
        onConfirm={deleteAdminUser}
      />
    </div>
  );
};
