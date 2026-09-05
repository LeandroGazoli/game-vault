"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { UserGame, GameStatus, LibraryStats, calculateGamerLevel } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { getUserLibrary, saveUserGame, removeUserGame, batchSaveUserGames, saveUserProfile } from "@/lib/firebase";
import confetti from "canvas-confetti";
import { triggerSuccessHaptic } from "@/lib/capacitor";

interface GameLibraryContextType {
  library: UserGame[];
  stats: LibraryStats;
  isLoading: boolean;
  addOrUpdateGame: (gameData: Partial<UserGame> & { gameId: number | string; gameTitle: string }) => Promise<void>;
  batchAddGames: (gamesData: Array<Partial<UserGame> & { gameId: number | string; gameTitle: string }>) => Promise<number>;
  deleteGame: (gameId: number | string) => Promise<void>;
  getGameInLibrary: (gameId: number | string) => UserGame | undefined;
  getGamesByStatus: (status: GameStatus) => UserGame[];
  levelUpData: { newLevel: number; oldLevel: number; rankTitle: string } | null;
  dismissLevelUp: () => void;
}

const GameLibraryContext = createContext<GameLibraryContextType | undefined>(undefined);

export function GameLibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [library, setLibrary] = useState<UserGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const libraryRef = useRef<UserGame[]>(library);

  useEffect(() => {
    libraryRef.current = library;
  }, [library]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        if (user) {
          const userGames = await getUserLibrary(user.uid);
          setLibrary(userGames || []);
        } else {
          setLibrary([]);
        }
      } catch (err) {
        console.error("Erro ao carregar biblioteca:", err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [user?.uid]);

  const triggerZeradoConfetti = useCallback(() => {
    try {
      triggerSuccessHaptic();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00E5FF", "#6366f1", "#f59e0b", "#10b981"],
      });
    } catch (e) {}
  }, []);

  const addOrUpdateGame = useCallback(
    async (gameData: Partial<UserGame> & { gameId: number | string; gameTitle: string }) => {
      if (!user) return;

      const currentLibrary = libraryRef.current;
      const existingIndex = currentLibrary.findIndex(
        (g) => String(g.gameId) === String(gameData.gameId)
      );
      const isNewBeaten =
        gameData.status === "completed" &&
        (!currentLibrary[existingIndex] || currentLibrary[existingIndex].status !== "completed");

      const now = new Date().toISOString();
      const updatedGame: UserGame = {
        gameId: gameData.gameId,
        gameSlug: gameData.gameSlug || String(gameData.gameId),
        gameTitle: gameData.gameTitle,
        gameCover: gameData.gameCover || null,
        status: gameData.status || "backlog",
        completionType: gameData.status === "completed" ? gameData.completionType || null : null,
        userRating: gameData.userRating !== undefined ? gameData.userRating : null,
        userPlaytimeHours: gameData.userPlaytimeHours ?? null,
        userReview: gameData.userReview || "",
        platformPlayed: gameData.platformPlayed || "PC",
        platformsPlayed: gameData.platformsPlayed || [gameData.platformPlayed || "PC"],
        isFavorite: gameData.isFavorite ?? false,
        completedAt: gameData.status === "completed" ? gameData.completedAt || now : null,
        startedAt: gameData.startedAt || now,
        createdAt: existingIndex >= 0 ? currentLibrary[existingIndex].createdAt : now,
        updatedAt: now,
        metacritic: gameData.metacritic ?? null,
        hltbData: gameData.hltbData ?? null,
        genres: gameData.genres || [],
        releaseYear: gameData.releaseYear || "",
        dlcs:
          gameData.dlcs !== undefined
            ? gameData.dlcs
            : existingIndex >= 0
            ? currentLibrary[existingIndex].dlcs
            : undefined,
        parentGameId:
          gameData.parentGameId !== undefined
            ? gameData.parentGameId
            : existingIndex >= 0
            ? currentLibrary[existingIndex].parentGameId
            : undefined,
        parentGameTitle:
          gameData.parentGameTitle !== undefined
            ? gameData.parentGameTitle
            : existingIndex >= 0
            ? currentLibrary[existingIndex].parentGameTitle
            : undefined,
        includeDlcHoursInTotal:
          gameData.includeDlcHoursInTotal !== undefined
            ? gameData.includeDlcHoursInTotal
            : existingIndex >= 0
            ? currentLibrary[existingIndex].includeDlcHoursInTotal ?? true
            : true,
      };

      setLibrary((prev) => {
        const nextList = [...prev];
        const idx = nextList.findIndex((g) => String(g.gameId) === String(gameData.gameId));
        if (idx >= 0) {
          nextList[idx] = updatedGame;
        } else {
          nextList.unshift(updatedGame);
        }
        return nextList;
      });

      if (isNewBeaten) {
        triggerZeradoConfetti();
      }

      await saveUserGame(user.uid, updatedGame);
    },
    [user, triggerZeradoConfetti]
  );

  const batchAddGames = useCallback(
    async (gamesData: Array<Partial<UserGame> & { gameId: number | string; gameTitle: string }>) => {
      if (!gamesData || gamesData.length === 0) return 0;

      const currentLibrary = [...libraryRef.current];
      const now = new Date().toISOString();
      let hasNewCompleted = false;
      const gamesToSave: UserGame[] = [];

      for (const item of gamesData) {
        const existingIndex = currentLibrary.findIndex(
          (g) => String(g.gameId) === String(item.gameId)
        );
        const existing = existingIndex >= 0 ? currentLibrary[existingIndex] : null;

        if (item.status === "completed" && (!existing || existing.status !== "completed")) {
          hasNewCompleted = true;
        }

        const platform = item.platformPlayed || "PC";
        const platforms = item.platformsPlayed || (existing?.platformsPlayed ? [...existing.platformsPlayed] : [platform]);
        if (!platforms.includes(platform)) {
          platforms.push(platform);
        }

        const updatedGame: UserGame = {
          gameId: item.gameId as any,
          gameSlug: item.gameSlug || String(item.gameId),
          gameTitle: item.gameTitle,
          gameCover: item.gameCover !== undefined ? item.gameCover : existing?.gameCover || null,
          status: item.status || existing?.status || "backlog",
          completionType: item.status === "completed" ? item.completionType || existing?.completionType || null : null,
          userRating: item.userRating !== undefined ? item.userRating : existing?.userRating ?? null,
          userPlaytimeHours: item.userPlaytimeHours !== undefined ? item.userPlaytimeHours : existing?.userPlaytimeHours ?? null,
          userReview: item.userReview || existing?.userReview || "",
          platformPlayed: platform,
          platformsPlayed: platforms,
          isFavorite: item.isFavorite ?? existing?.isFavorite ?? false,
          completedAt: item.status === "completed" ? item.completedAt || existing?.completedAt || now : null,
          startedAt: item.startedAt || existing?.startedAt || now,
          createdAt: existing?.createdAt || now,
          updatedAt: now,
          metacritic: item.metacritic !== undefined ? item.metacritic : existing?.metacritic ?? null,
          hltbData: item.hltbData !== undefined ? item.hltbData : existing?.hltbData ?? null,
          genres: item.genres || existing?.genres || [],
          releaseYear: item.releaseYear || existing?.releaseYear || "",
        };

        if (item.dlcs !== undefined || existing?.dlcs) {
          updatedGame.dlcs = item.dlcs || existing?.dlcs;
        }
        if (item.parentGameId !== undefined || existing?.parentGameId) {
          updatedGame.parentGameId = item.parentGameId || existing?.parentGameId;
        }

        if (existingIndex >= 0) {
          currentLibrary[existingIndex] = updatedGame;
        } else {
          currentLibrary.unshift(updatedGame);
        }
        gamesToSave.push(updatedGame);
      }

      setLibrary(currentLibrary);

      if (hasNewCompleted) {
        triggerZeradoConfetti();
      }

      if (user) {
        try {
          await batchSaveUserGames(user.uid, gamesToSave);
        } catch (saveError) {
          console.error("Erro ao persistir lote de jogos no Firestore:", saveError);
          throw saveError;
        }
      }

      return gamesToSave.length;
    },
    [user, triggerZeradoConfetti]
  );

  const deleteGame = useCallback(
    async (gameId: number | string) => {
      if (!user) return;
      setLibrary((prev) => prev.filter((g) => String(g.gameId) !== String(gameId)));
      await removeUserGame(user.uid, gameId);
    },
    [user]
  );

  const getGameInLibrary = useCallback((gameId: number | string) => {
    return libraryRef.current.find((g) => String(g.gameId) === String(gameId));
  }, []);

  const getGamesByStatus = useCallback((status: GameStatus) => {
    return libraryRef.current.filter((g) => g.status === status);
  }, []);

  const stats: LibraryStats = useMemo(() => {
    let totalPlaytime = 0;
    let ratingSum = 0;
    let ratedCount = 0;
    const genreMap: Record<string, number> = {};

    let completed = 0;
    let playing = 0;
    let dropped = 0;
    let backlog = 0;
    let libraryCount = 0;

    for (const g of library) {
      if (g.status === "completed") completed++;
      else if (g.status === "playing") playing++;
      else if (g.status === "dropped") dropped++;
      else if (g.status === "backlog") backlog++;
      else if (g.status === "library") libraryCount++;

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
      libraryCount,
      totalPlaytimeHours: totalPlaytime,
      averageRating: ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
      topGenres,
    };
  }, [library]);

  // Controle de persistência de nível e comemoração única de Level-Up
  const isHydratedRef = useRef(false);
  const celebratedLevelRef = useRef<number>(0);
  const lastSavedGamerRef = useRef<{ level: number; xp: number } | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; oldLevel: number; rankTitle: string } | null>(null);

  // Reseta referências se o usuário mudar ou deslogar
  const currentUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentUserIdRef.current !== (user?.uid ?? null)) {
      currentUserIdRef.current = user?.uid ?? null;
      isHydratedRef.current = false;
      celebratedLevelRef.current = 0;
      lastSavedGamerRef.current = null;
      setLevelUpData(null);
    }
  }, [user?.uid]);

  const dismissLevelUp = useCallback(() => {
    if (user && levelUpData) {
      try {
        localStorage.setItem(`gamevault_celebrated_level_${user.uid}`, String(levelUpData.newLevel));
      } catch {}
    }
    setLevelUpData(null);
  }, [user, levelUpData]);

  useEffect(() => {
    if (!user || isLoading) return;
    const currentInfo = calculateGamerLevel(stats);
    const { level, xp, rankTitle } = currentInfo;

    // 1. Fase de Hidratação Inicial:
    // NUNCA dispara comemoração no carregamento da página, F5 ou login.
    if (!isHydratedRef.current) {
      isHydratedRef.current = true;

      let storedCelebrated = 0;
      try {
        const storedStr = localStorage.getItem(`gamevault_celebrated_level_${user.uid}`);
        if (storedStr) storedCelebrated = parseInt(storedStr, 10) || 0;
      } catch {}

      const firestoreCelebrated = user.celebratedGamerLevel || user.gamerLevel || 0;
      // Define a base como o maior nível registrado ou o nível atual
      const baseCelebrated = Math.max(storedCelebrated, firestoreCelebrated, level);
      celebratedLevelRef.current = baseCelebrated;

      try {
        localStorage.setItem(`gamevault_celebrated_level_${user.uid}`, String(baseCelebrated));
      } catch {}

      lastSavedGamerRef.current = { level, xp };

      if (
        user.gamerLevel !== level ||
        user.gamerXp !== xp ||
        user.celebratedGamerLevel !== baseCelebrated
      ) {
        saveUserProfile(user.uid, {
          gamerLevel: level,
          gamerXp: xp,
          celebratedGamerLevel: baseCelebrated,
        }).catch((err) => console.warn("Erro ao sincronizar nível gamer inicial:", err));
      }
      return;
    }

    // 2. Fase Ativa:
    // O jogador subiu de nível durante a sessão ativa (ex: adicionou/zerou jogo ou somou horas)
    if (level > celebratedLevelRef.current) {
      const oldLevel = celebratedLevelRef.current;
      celebratedLevelRef.current = level;

      try {
        localStorage.setItem(`gamevault_celebrated_level_${user.uid}`, String(level));
      } catch {}

      lastSavedGamerRef.current = { level, xp };
      saveUserProfile(user.uid, {
        gamerLevel: level,
        gamerXp: xp,
        celebratedGamerLevel: level,
      }).catch((err) => console.warn("Erro ao persistir nível gamer conquistado:", err));

      // Dispara a comemoração UMA ÚNICA VEZ
      setLevelUpData({ newLevel: level, oldLevel, rankTitle });
      return;
    }

    // 3. Atualização de XP apenas (sem subir de nível)
    if (
      (user.gamerLevel !== level || user.gamerXp !== xp) &&
      (lastSavedGamerRef.current?.level !== level || lastSavedGamerRef.current?.xp !== xp)
    ) {
      lastSavedGamerRef.current = { level, xp };
      saveUserProfile(user.uid, {
        gamerLevel: level,
        gamerXp: xp,
      }).catch((err) => console.warn("Erro ao sincronizar XP gamer:", err));
    }
  }, [stats, user, isLoading]);

  const contextValue = useMemo(
    () => ({
      library,
      stats,
      isLoading,
      addOrUpdateGame,
      batchAddGames,
      deleteGame,
      getGameInLibrary,
      getGamesByStatus,
      levelUpData,
      dismissLevelUp,
    }),
    [
      library,
      stats,
      isLoading,
      addOrUpdateGame,
      batchAddGames,
      deleteGame,
      getGameInLibrary,
      getGamesByStatus,
      levelUpData,
      dismissLevelUp,
    ]
  );

  return (
    <GameLibraryContext.Provider value={contextValue}>
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
