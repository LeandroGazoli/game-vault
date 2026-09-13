"use client";

import { useState, useEffect, useMemo } from "react";
import { Game, UserGame, SystemSettings } from "@/lib/types";
import { db, getSystemSettings, DEFAULT_SYSTEM_SETTINGS } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useHomeCatalog(library: UserGame[]) {
  const [topTenGames, setTopTenGames] = useState<Game[]>([]);
  const [releases, setReleases] = useState<Game[]>([]);
  const [upcoming, setUpcoming] = useState<Game[]>([]);
  const [ptbrGames, setPtbrGames] = useState<Game[]>([]);
  const [shortGames, setShortGames] = useState<Game[]>([]);
  const [gtaGames, setGtaGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Configurações globais (Hero Carousel configurado pelo Admin)
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (!db) {
      getSystemSettings()
        .then((s) => {
          setSettings(s);
          setSettingsLoaded(true);
        })
        .catch((err) => {
          console.warn(err);
          setSettingsLoaded(true);
        });
      return;
    }
    const unsub = onSnapshot(
      doc(db, "system", "settings"),
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() } as SystemSettings);
        } else {
          setSettings(DEFAULT_SYSTEM_SETTINGS);
        }
        setSettingsLoaded(true);
      },
      (err) => {
        console.warn("Erro ao sincronizar configurações do sistema:", err);
        getSystemSettings()
          .then((s) => {
            setSettings(s);
            setSettingsLoaded(true);
          })
          .catch(() => setSettingsLoaded(true));
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [popRes, relRes, upRes, ptbrRes, shortRes, gtaRes] = await Promise.all([
          fetch("/api/games/rankings?category=popular&limit=10"),
          fetch("/api/games/releases"),
          fetch("/api/games/upcoming"),
          fetch("/api/games/curated?type=ptbr"),
          fetch("/api/games/curated?type=short"),
          fetch("/api/games/search?q=Grand+Theft+Auto&pageSize=10"),
        ]);

        if (isMounted) {
          if (popRes.ok) {
            const data = await popRes.json();
            setTopTenGames(data.games || []);
          }
          if (relRes.ok) {
            const data = await relRes.json();
            setReleases(data.games || []);
          }
          if (upRes.ok) {
            const data = await upRes.json();
            setUpcoming(data.games || []);
          }
          if (ptbrRes.ok) {
            const data = await ptbrRes.json();
            setPtbrGames(data.games || []);
          }
          if (shortRes.ok) {
            const data = await shortRes.json();
            setShortGames(data.games || []);
          }
          if (gtaRes.ok) {
            const data = await gtaRes.json();
            setGtaGames(data.games || []);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar catálogo da home:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Jogo que o usuário está jogando atualmente (para o card de atalho)
  const currentlyPlaying = useMemo(() => {
    return library.find((g) => g.status === "playing");
  }, [library]);

  const playingGameObj: Game | null = useMemo(() => {
    if (!currentlyPlaying) return null;
    return {
      id: Number(currentlyPlaying.gameId),
      slug: currentlyPlaying.gameSlug,
      name: currentlyPlaying.gameTitle,
      background_image: currentlyPlaying.gameCover,
      metacritic: currentlyPlaying.metacritic,
      released: currentlyPlaying.releaseYear || null,
      genres: currentlyPlaying.genres?.map((name, i) => ({ id: i, name })) || [],
      platforms: [{ platform: { id: 1, name: currentlyPlaying.platformPlayed, slug: currentlyPlaying.platformPlayed.toLowerCase() } }],
      hltb: currentlyPlaying.hltbData || null,
    };
  }, [currentlyPlaying]);

  // Pool de jogos para a Roleta Gamer (usa a biblioteca do usuário se houver, ou populares da Home)
  const roulettePool: UserGame[] = useMemo(() => {
    if (library.length > 0) return library;
    return topTenGames.map((g) => ({
      gameId: g.id,
      gameSlug: g.slug,
      gameTitle: g.name,
      gameCover: g.background_image,
      status: "backlog" as const,
      userRating: null,
      userPlaytimeHours: null,
      userReview: "",
      platformPlayed: g.platforms?.[0]?.platform?.name || "PC",
      isFavorite: false,
      completedAt: null,
      startedAt: null,
      createdAt: "",
      updatedAt: "",
      metacritic: g.metacritic,
      hltbData: g.hltb,
    }));
  }, [library, topTenGames]);

  return {
    topTenGames,
    releases,
    upcoming,
    ptbrGames,
    shortGames,
    gtaGames,
    loading,
    settings,
    settingsLoaded,
    currentlyPlaying,
    playingGameObj,
    roulettePool,
  };
}
