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

const INITIAL_DEMO_LIBRARY: UserGame[] = [
  {
    gameId: 3272,
    gameSlug: "elden-ring",
    gameTitle: "Elden Ring",
    gameCover: "https://media.rawg.io/media/games/b29/b296f076615801c809ddca592f6ea9e1.jpg",
    status: "completed",
    userRating: 10,
    userPlaytimeHours: 125,
    userReview: "Uma obra-prima absoluta! A exploracao das Terras Intermedias e o combate sao simplesmente perfeitos. Melhores chefes da FromSoftware.",
    platformPlayed: "PC",
    isFavorite: true,
    completedAt: "2024-01-15T00:00:00.000Z",
    startedAt: "2023-11-10T00:00:00.000Z",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
    metacritic: 96,
    hltbData: { mainStory: 59, mainExtra: 101, completionist: 133, source: "HowLongToBeat" },
    genres: ["Action", "RPG"],
    releaseYear: "2022",
  },
  {
    gameId: 3328,
    gameSlug: "the-witcher-3-wild-hunt",
    gameTitle: "The Witcher 3: Wild Hunt",
    gameCover: "https://media.rawg.io/media/games/618/618c204e10740b79f4457ea8ba64cda4.jpg",
    status: "completed",
    userRating: 9.8,
    userPlaytimeHours: 95,
    userReview: "Narrativa impecavel, cada missao secundaria tem roteiro de filme. Geralt e Ciri inesqueciveis.",
    platformPlayed: "PlayStation 5",
    isFavorite: true,
    completedAt: "2023-08-20T00:00:00.000Z",
    startedAt: "2023-06-01T00:00:00.000Z",
    createdAt: "2023-08-20T00:00:00.000Z",
    updatedAt: "2023-08-20T00:00:00.000Z",
    metacritic: 93,
    hltbData: { mainStory: 51, mainExtra: 103, completionist: 173, source: "HowLongToBeat" },
    genres: ["Action", "RPG"],
    releaseYear: "2015",
  },
  {
    gameId: 452640,
    gameSlug: "baldurs-gate-3",
    gameTitle: "Baldur's Gate 3",
    gameCover: "https://media.rawg.io/media/games/699/699277d041a37a2782ab469d64e31e0c.jpg",
    status: "playing",
    userRating: 9.5,
    userPlaytimeHours: 48,
    userReview: "Estou no Ato 2 e a liberdade de escolhas e dialogos e inacreditavel. RPG definitivo da decada.",
    platformPlayed: "PC",
    isFavorite: true,
    completedAt: null,
    startedAt: "2024-02-01T00:00:00.000Z",
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-02-15T00:00:00.000Z",
    metacritic: 96,
    hltbData: { mainStory: 67, mainExtra: 110, completionist: 158, source: "HowLongToBeat" },
    genres: ["RPG", "Strategy"],
    releaseYear: "2023",
  },
  {
    gameId: 41494,
    gameSlug: "cyberpunk-2077",
    gameTitle: "Cyberpunk 2077",
    gameCover: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c424c0f5.jpg",
    status: "playing",
    userRating: 8.8,
    userPlaytimeHours: 28,
    userReview: "Com os patches 2.0 e Phantom Liberty virou outro jogo. Night City e deslumbrante.",
    platformPlayed: "PC",
    isFavorite: false,
    completedAt: null,
    startedAt: "2024-02-10T00:00:00.000Z",
    createdAt: "2024-02-10T00:00:00.000Z",
    updatedAt: "2024-02-18T00:00:00.000Z",
    metacritic: 86,
    hltbData: { mainStory: 25, mainExtra: 61, completionist: 104, source: "HowLongToBeat" },
    genres: ["Action", "RPG"],
    releaseYear: "2020",
  },
  {
    gameId: 5679,
    gameSlug: "the-elder-scrolls-v-skyrim",
    gameTitle: "The Elder Scrolls V: Skyrim",
    gameCover: "https://media.rawg.io/media/games/7cf/7cfc9220b401b7a300e409e539c9afd5.jpg",
    status: "dropped",
    userRating: 7.0,
    userPlaytimeHours: 14,
    userReview: "Mundo interessante, mas o combate corpo a corpo envelheceu um pouco e perdi o foco com tantas missoes secundarias.",
    platformPlayed: "PC",
    isFavorite: false,
    completedAt: null,
    startedAt: "2023-04-10T00:00:00.000Z",
    createdAt: "2023-04-10T00:00:00.000Z",
    updatedAt: "2023-04-25T00:00:00.000Z",
    metacritic: 94,
    hltbData: { mainStory: 34, mainExtra: 109, completionist: 232, source: "HowLongToBeat" },
    genres: ["Action", "RPG"],
    releaseYear: "2011",
  },
  {
    gameId: 22509,
    gameSlug: "the-legend-of-zelda-tears-of-the-kingdom",
    gameTitle: "The Legend of Zelda: Tears of the Kingdom",
    gameCover: "https://media.rawg.io/media/games/e87/e8736bb6a04ba0156d9841f3d3ca7ebf.jpg",
    status: "backlog",
    userRating: null,
    userPlaytimeHours: null,
    userReview: "Comprei no lancamento, planejo jogar assim que zerar Baldurs Gate 3.",
    platformPlayed: "Nintendo Switch",
    isFavorite: false,
    completedAt: null,
    startedAt: null,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
    metacritic: 96,
    hltbData: { mainStory: 59, mainExtra: 111, completionist: 236, source: "HowLongToBeat" },
    genres: ["Action", "Adventure"],
    releaseYear: "2023",
  }
];

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
      const userGames = await getUserLibrary(user.uid);
      if (userGames.length > 0) {
        setLibrary(userGames);
      } else if (user.uid === "demo-gamer-123") {
        setLibrary(INITIAL_DEMO_LIBRARY);
        for (const g of INITIAL_DEMO_LIBRARY) {
          await saveUserGame(user.uid, g);
        }
      } else {
        setLibrary([]);
      }
      setIsLoading(false);
    }

    load();
  }, [user]);

  const triggerZeradoConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#6366f1", "#f59e0b", "#3b82f6"],
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
      userRating: gameData.userRating ?? null,
      userPlaytimeHours: gameData.userPlaytimeHours ?? null,
      userReview: gameData.userReview || "",
      platformPlayed: gameData.platformPlayed || "PC",
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
