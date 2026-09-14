"use client";

import React from "react";
import { UserGame } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import ProfileSettingsHub from "./settings/ProfileSettingsHub";

export interface ProfileEditViewProps {
  isPage?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenUpgrade?: () => void;
  games?: UserGame[];
  initialTab?: "info" | "appearance" | "titles" | "markdown" | "socials" | "showcase" | "visibility";
}

export default function ProfileEditView({
  isPage = false,
  isOpen = true,
  onClose,
  onOpenUpgrade,
  games: providedGames,
  initialTab = "info",
}: ProfileEditViewProps) {
  const libraryContext = useGameLibrary();
  const games = providedGames && providedGames.length > 0 ? providedGames : libraryContext?.library || [];

  if (!isPage && !isOpen) {
    return null;
  }

  if (!isPage) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
        <ProfileSettingsHub
          isPage={false}
          initialTab={initialTab}
          onClose={onClose}
          onOpenUpgrade={onOpenUpgrade}
          games={games}
        />
      </div>
    );
  }

  return (
    <ProfileSettingsHub
      isPage={true}
      initialTab={initialTab}
      onClose={onClose}
      onOpenUpgrade={onOpenUpgrade}
      games={games}
    />
  );
}
