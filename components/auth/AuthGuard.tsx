"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { GeneralService } from "@/lib/services/generalService";
import { SessionTimeoutModal } from "@/components/modals/SessionTimeoutModal";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; 
const WARNING_THRESHOLD = 30 * 1000; 

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  
  // Session Timeout State
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = useCallback((): void => {
    // 1. Instantly hide the modal for immediate UI feedback
    setShowTimeoutModal(false);
    
    // 2. Clear all active timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current as any);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current as any);
    
    // 3. Clear data and navigate immediately using SPA router (much faster than window.location.href)
    GeneralService.saveStorageData("secret", ""); // Invalidate session locally
    localStorage.clear();
    sessionStorage.clear();
    
    // 4. Perform the redirect
    router.replace("/login");
    
    // 5. Cleanup cookies in the background
    GeneralService.logout(); 
  }, [router]);

  const startCountdown = useCallback(() => {
    // 1. Reset state
    setCountdown(30);
    setShowTimeoutModal(true);
    
    // 2. Clear any existing interval to prevent double-counting
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // 3. Start a new fresh interval
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear interval exactly at 0
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const lastResetRef = useRef<number>(0);
  const resetTimer = useCallback(() => {
    const now = Date.now();
    // Throttle resets to once every 2 seconds to reduce CPU/Main thread load
    if (now - lastResetRef.current < 2000) return;
    lastResetRef.current = now;

    if (showTimeoutModal) return; 
    
    lastActivityRef.current = now;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      startCountdown();
    }, INACTIVITY_TIMEOUT - WARNING_THRESHOLD);
  }, [showTimeoutModal, startCountdown]);

  const stayLoggedIn = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowTimeoutModal(false);
    resetTimer();
  };

  // Trigger logout when countdown reaches 0
  useEffect(() => {
    if (showTimeoutModal && countdown === 0) {
      handleLogout();
    }
  }, [countdown, showTimeoutModal, handleLogout]);

  useEffect(() => {
    const token = GeneralService.getStorageData("secret");
    const isAuthenticated = token && typeof token === "string" && token.trim() !== "";

    if (!isAuthenticated) {
      setAuthorized(false);
      router.replace(`/login?callbackUrl=${pathname}`);
    } else {
      setAuthorized(true);
      resetTimer();
      
      const activities = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
      const activityHandler = () => resetTimer();

      activities.forEach((event) => {
        window.addEventListener(event, activityHandler);
      });

      return () => {
        activities.forEach((event) => {
          window.removeEventListener(event, activityHandler);
        });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // We DO NOT clear the countdown interval here because it would break the live countdown 
        // when the component re-renders or when dependencies change.
      };
    }
  }, [pathname, router, resetTimer]);

  // Separate cleanup for the countdown interval only on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  if (!authorized) {
    return null;
  }

  return (
    <>
      {children}
      <SessionTimeoutModal
        isOpen={showTimeoutModal}
        countdown={countdown}
        onStayLoggedIn={stayLoggedIn}
        onLogout={handleLogout}
      />
    </>
  );
}
