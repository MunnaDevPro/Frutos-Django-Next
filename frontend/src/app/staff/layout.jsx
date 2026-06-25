"use client";

import { StaffAuthProvider } from "./_context/StaffAuthContext";
import { ToastProvider } from "@/app/dashboard/_components/Toaster";
import StaffAnnouncementListener from "./_components/StaffAnnouncementListener";

export default function StaffLayout({ children }) {
  return (
    <StaffAuthProvider>
      <ToastProvider>
        <StaffAnnouncementListener />
        {children}
      </ToastProvider>
    </StaffAuthProvider>
  );
}
