"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TwoFactorAuthModal } from "@/components/modals/TwoFactorAuthModal";
import { AuthService } from "@/lib/services/authService";
import { GeneralService } from "@/lib/services/generalService";
import toast from "react-hot-toast";

function DashboardFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [setupAttempted, setSetupAttempted] = useState(false);

  useEffect(() => {
    const start2FASetup = async () => {
      if (setupAttempted || typeof window === "undefined") return;

      const hasPendingSetup = sessionStorage.getItem("pending2FASetup") === "true";
      const user = GeneralService.getStorageData("core");
      const shouldSetUp2FA = hasPendingSetup || user?.twoFactorAuthEnabled === false;

      if (!shouldSetUp2FA) return;

      setSetupAttempted(true);
      setShow2FAModal(true);

      try {
        const res = await AuthService.enable2fa({ method: "TOTP", enable: true });
        if ((res.statusCode === 200) || (!res.failed && res.statusCode !== undefined)) {
          setQrCode(res.data?.["totp-url"] || res["totp-url"] || "");
          setSecretKey(res.data?.["totp-secret"] || res["totp-secret"] || "");
        } else {
          setShow2FAModal(false);
          toast.error(res.message || "Failed to start 2FA setup");
        }
      } catch (err) {
        console.error(err);
        setShow2FAModal(false);
        toast.error("Something went wrong starting 2FA setup");
      }
    };

    start2FASetup();
  }, [setupAttempted]);

  const handle2FASetupComplete = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pending2FASetup");
    }

    const user = GeneralService.getStorageData("core");
    if (user) {
      GeneralService.saveStorageData("core", {
        ...user,
        twoFactorAuthEnabled: true,
      });
    }

    setShow2FAModal(false);
  };

  return (
    <main className="min-h-screen bg-white lg:flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <section className="min-h-screen min-w-0 flex-1 lg:ml-[290px] flex flex-col">
        <Navbar openMenu={() => setIsSidebarOpen(true)} />

        <div className="flex-1 min-w-0 flex flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </section>

      <TwoFactorAuthModal
        isOpen={show2FAModal}
        onClose={handle2FASetupComplete}
        qrCode={qrCode}
        secretKey={secretKey}
        hideCloseOption
      />
    </main>
  );
}

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardFrame>
        {children}
      </DashboardFrame>
    </AuthGuard>
  );
}
