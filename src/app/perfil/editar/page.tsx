"use client";

import React, { useState, Suspense } from "react";
import ProfileEditView from "@/components/profile/ProfileEditView";
import UpgradeModal from "@/components/UpgradeModal";
import { useSearchParams } from "next/navigation";

function ProfileEditContent() {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "info";

  return (
    <>
      <ProfileEditView
        isPage={true}
        initialTab={initialTab}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
    </>
  );
}

export default function ProfileEditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0e14] text-white flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <ProfileEditContent />
    </Suspense>
  );
}
