"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { UserGame, GameStatus, LibraryStats } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { getUserLibrary, saveUserGame, removeUserGame } from "@/lib/firebase";
import confetti from "canvas-confetti";

interface GameLibraryContextType {
  library: UserGame[];
  stats: LibraryStats;
  isLoading: boolean;
  addOrUpdateGame: (gameData: Partial<UserGame> & { gameId: number | string; gameTitle: string }) => Promise<void>;
  deleteGame: (gameId: number | string) => Promise<void>;
  getGameInLibrary: (gameId: number | string) => UserGame | undefined;
  getGamesByStatus: (status: GameStatus) => UserGame[];
}

const GameLibraryContext = createContext<GameLibraryContextType | undefined>(undefined);

export function GameLibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [library, setLibrary] = useState<UserGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLibrary([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userGames = await getUserLibrary(user.uid);
        setLibrary(userGames || []);
      } catch (err) {
        console.error("Erro ao carregar biblioteca do usuário:", err);
        setLibrary([]);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [user]);

  const triggerZeradoConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00E5FF", "#6366f1", "#f59e0b", "#10b981"],
      });
    } catch (e) {}
  };

  const addOrUpdateGame = async (
    gameData: Partial<UserGame> & { gameId: number | string; gameTitle: string }
  ) => {
    if (!user) return;

    const existingIndex = library.findIndex((g) => String(g.gameId) === String(gameData.gameId));
    const isNewBeaten =
      gameData.status === "completed" &&
      (!library[existingIndex] || library[existingIndex].status !== "completed");

    const now = new Date().toISOString();
    const updatedGame: UserGame = {
      gameId: gameData.gameId,
      gameSlug: gameData.gameSlug || String(gameData.gameId),
      gameTitle: gameData.gameTitle,
      gameCover: gameData.gameCover || null,
      status: gameData.status || "playing",
      completionType: gameData.completionType || null,
      userRating: gameData.userRating ?? null,
      userPlaytimeHours: gameData.userPlaytimeHours ?? null,
      userReview: gameData.userReview || "",
      platformPlayed: gameData.platformPlayed || "PC",
      platformsPlayed: gameData.platformsPlayed || [gameData.platformPlayed || "PC"],
      isFavorite: gameData.isFavorite ?? false,
      completedAt: gameData.status === "completed" ? (gameData.completedAt || now) : null,
      startedAt: gameData.startedAt || now,
      createdAt: existingIndex >= 0 ? library[existingIndex].createdAt : now,
      updatedAt: now,
      metacritic: gameData.metacritic ?? null,
      hltbData: gameData.hltbData ?? null,
      genres: gameData.genres || [],
      releaseYear: gameData.releaseYear || "",
    };

    setLibrary((prev) => {
      const copy = [...prev];
      if (existingIndex >= 0) {
        copy[existingIndex] = updatedGame;
      } else {
        copy.unshift(updatedGame);
      }
      return copy;
    });

    if (isNewBeaten) {
      triggerZeradoConfetti();
    }

    await saveUserGame(user.uid, updatedGame);
  };

  const deleteGame = async (gameId: number | string) => {
    if (!user) return;
    setLibrary((prev) => prev.filter((g) => String(g.gameId) !== String(gameId)));
    await removeUserGame(user.uid, gameId);
  };

  const getGameInLibrary = (gameId: number | string) => {
    return library.find((g) => String(g.gameId) === String(gameId));
  };

  const getGamesByStatus = (status: GameStatus) => {
    return library.filter((g) => g.status === status);
  };

  const stats: LibraryStats = useMemo(() => {
    let totalPlaytime = 0;
    let ratingSum = 0;
    let ratedCount = 0;
    const genreMap: Record<string, number> = {};

    let completed = 0;
    let playing = 0;
    let dropped = 0;
    let backlog = 0;

    for (const g of library) {
      if (g.status === "completed") completed++;
      else if (g.status === "playing") playing++;
      else if (g.status === "dropped") dropped++;
      else if (g.status === "backlog") backlog++;

      if (g.userPlaytimeHours && g.userPlaytimeHours > 0) {
        totalPlaytime += g.userPlaytimeHours;
      }

      if (g.userRating && g.userRating > 0) {
        ratingSum += g.userRating;
        ratedCount++;
      }

      if (g.genres) {
        for (const genre of g.genres) {
          genreMap[genre] = (genreMap[genre] || 0) + 1;
        }
      }
    }

    const topGenres = Object.entries(genreMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalGames: library.length,
      completedCount: completed,
      playingCount: playing,
      droppedCount: dropped,
      backlogCount: backlog,
      totalPlaytimeHours: totalPlaytime,
      averageRating: ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
      topGenres,
    };
  }, [library]);

  return (
    <GameLibraryContext.Provider
      value={{
        library,
        stats,
        isLoading,
        addOrUpdateGame,
        deleteGame,
        getGameInLibrary,
        getGamesByStatus,
      }}
    >
      {children}
    </GameLibraryContext.Provider>
  );
}

export function useGameLibrary() {
  const context = useContext(GameLibraryContext);
  if (!context) {
    throw new Error("useGameLibrary deve ser usado dentro de GameLibraryProvider");
  }
  return context;
}
