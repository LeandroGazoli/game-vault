import { UserGame } from "./types";
import { saveUserGame, removeUserGame, saveUserProfile } from "./firebase";

let hasRunHealingThisSession = false;

/**
 * Rotina de auto-cura para bibliotecas que contêm jogos com IDs sintéticos/fallback (>= 9000000).
 * Executada em background de forma silenciosa para não travar a interface do usuário.
 * Substitui os IDs temporários pelos IDs canônicos oficiais do IGDB no Firestore.
 */
export async function healSyntheticLibraryIds(
  userId: string,
  games: UserGame[],
  onHealed?: (healedGames: UserGame[]) => void
): Promise<UserGame[] | null> {
  if (!userId || games.length === 0 || hasRunHealingThisSession) return null;

  const syntheticGames = games.filter((g) => {
    const numId = Number(g.gameId);
    return isNaN(numId) || numId >= 9000000;
  });

  if (syntheticGames.length === 0) return null;

  hasRunHealingThisSession = true;

  try {
    const titles = Array.from(new Set(syntheticGames.map((g) => g.gameTitle)));
    const res = await fetch("/api/games/batch-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titles }),
    });

    if (!res.ok) return null;

    const data: any = await res.json();
    const matches = data.matches || {};

    let hasChanges = false;
    const updatedGames = [...games];

    for (const synGame of syntheticGames) {
      const match = matches[synGame.gameTitle];
      if (match && match.gameId && match.gameId !== synGame.gameId) {
        const oldGameId = synGame.gameId;
        const newGameId = match.gameId;

        const healedGame: UserGame = {
          ...synGame,
          gameId: newGameId,
          gameSlug: match.slug || synGame.gameSlug,
          gameCover: synGame.gameCover || match.cover || null,
          metacritic: synGame.metacritic ?? match.metacritic ?? null,
          releaseYear: synGame.releaseYear || match.releaseYear || "",
          genres: synGame.genres && synGame.genres.length > 0 ? synGame.genres : match.genres || [],
          updatedAt: new Date().toISOString(),
        };

        // 1. Grava o novo documento com o ID canônico do IGDB
        await saveUserGame(userId, healedGame);

        // 2. Remove o documento antigo com ID sintético
        await removeUserGame(userId, oldGameId);

        // 3. Atualiza o array em memória
        const idx = updatedGames.findIndex((g) => g.gameId === oldGameId);
        if (idx !== -1) {
          updatedGames[idx] = healedGame;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      const now = new Date().toISOString();
      await saveUserProfile(userId, { libraryUpdatedAt: now });
      if (onHealed) {
        onHealed(updatedGames);
      }
      return updatedGames;
    }
  } catch (err) {
    console.warn("[LibraryHealer] Aviso ao executar auto-cura de IDs sintéticos:", err);
  }

  return null;
}
