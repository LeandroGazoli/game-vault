import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  addDoc,
  deleteField,
} from "firebase/firestore";
import {
  IndieGame,
  IndieComment,
  IndieSubmissionForm,
  IndieSpotlightLocation,
  IndieGameStatus,
  INDIE_CREATOR_TITLE,
} from "./types/indie.types";

const INDIES_COLLECTION = "indie_games";
const USERS_COLLECTION = "users";

/**
 * Sanitiza objetos para o Firestore:
 * - Para criação (setDoc/addDoc): remove campos `undefined` recursivamente, preservando a estrutura de objetos aninhados.
 * - Para atualização (updateDoc): achata chaves aninhadas usando dot-notation (ex: `systemRequirements.recommended`)
 *   para que `deleteField()` seja válido no Firestore (o Firestore só aceita deleteField em chaves de primeiro nível da query de update, inclusive se forem chaves com ponto).
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T, forUpdate = false, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === undefined) {
      if (forUpdate) {
        result[fullKey] = deleteField();
      }
      continue;
    }

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      if (forUpdate) {
        // Achata o objeto recursivamente em chaves com ponto (dot notation)
        const nested = sanitizeForFirestore(value, true, fullKey);
        Object.assign(result, nested);
      } else {
        const nested = sanitizeForFirestore(value, false, "");
        result[key] = nested;
      }
    } else {
      if (forUpdate) {
        result[fullKey] = value;
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Submete ou cadastra um jogo indie.
 * Se submittedBy for informado como admin e initialStatus for "approved", o jogo já entra publicado.
 */
export async function submitIndieGame(
  data: IndieSubmissionForm,
  userId: string,
  options?: {
    initialStatus?: IndieGameStatus;
    isSpotlight?: boolean;
    spotlightLocations?: IndieSpotlightLocation[];
  }
): Promise<string> {
  const baseSlug = slugify(data.title);
  const docId = `indie-${Date.now()}`;
  const now = new Date().toISOString();
  const status = options?.initialStatus || "pending";

  const newGame: IndieGame = {
    ...data,
    id: docId,
    slug: `${baseSlug}-${docId.slice(-4)}`,
    status,
    votesCount: 0,
    voters: [],
    isSpotlight: options?.isSpotlight ?? false,
    spotlightLocations: options?.spotlightLocations ?? [],
    submittedBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = doc(db, INDIES_COLLECTION, docId);
  const sanitizedGame = sanitizeForFirestore(newGame, false);
  await setDoc(docRef, sanitizedGame);

  // Se já for cadastrado como aprovado (ex.: pelo próprio admin para sua conta), concede o título
  if (status === "approved" && userId) {
    try {
      await grantIndieCreatorTitleToUser(userId);
    } catch (err) {
      console.warn("Erro ao atribuir título de criador no submit:", err);
    }
  }

  return docId;
}

/**
 * Atualiza um jogo indie existente (utilizado na edição do admin)
 */
export async function updateIndieGame(
  gameId: string,
  data: Partial<IndieSubmissionForm> & {
    status?: IndieGameStatus;
    isSpotlight?: boolean;
    spotlightLocations?: IndieSpotlightLocation[];
  }
): Promise<void> {
  const docRef = doc(db, INDIES_COLLECTION, gameId);
  const updates = sanitizeForFirestore(
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    true
  );
  await updateDoc(docRef, updates);
}

/**
 * Atribui o título gamer exclusivo "👾 Criador Indie MyGameList" ao perfil do usuário
 */
export async function grantIndieCreatorTitleToUser(userId: string): Promise<void> {
  if (!userId) return;
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const userData = snap.data();
  const currentCreatedTitles: string[] = Array.isArray(userData.createdCustomTitles)
    ? userData.createdCustomTitles
    : [];

  const updates: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (!currentCreatedTitles.includes(INDIE_CREATOR_TITLE)) {
    updates.createdCustomTitles = arrayUnion(INDIE_CREATOR_TITLE);
  }

  // Se o usuário não tiver título customizado equipado, equipa o de criador automaticamente
  if (!userData.customTitle) {
    updates.customTitle = INDIE_CREATOR_TITLE;
    const currentCustomTitles: string[] = Array.isArray(userData.customTitles)
      ? userData.customTitles
      : [];
    if (!currentCustomTitles.includes(INDIE_CREATOR_TITLE)) {
      updates.customTitles = [INDIE_CREATOR_TITLE, ...currentCustomTitles].slice(0, 3);
    }
  }

  await updateDoc(userRef, updates);
}

/**
 * Busca jogos indies aprovados para exibição pública
 */
export async function fetchApprovedIndies(
  sortBy: "votes" | "recent" = "votes"
): Promise<IndieGame[]> {
  try {
    const q = query(
      collection(db, INDIES_COLLECTION),
      where("status", "==", "approved")
    );
    const snap = await getDocs(q);
    const games = snap.docs.map((d) => ({ id: d.id, ...d.data() } as IndieGame));

    if (sortBy === "votes") {
      return games.sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
    }
    return games.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Erro ao buscar indies aprovados:", error);
    return [];
  }
}

/**
 * Busca um jogo indie específico por slug ou ID
 */
export async function fetchIndieBySlug(slugOrId: string): Promise<IndieGame | null> {
  try {
    const docRef = doc(db, INDIES_COLLECTION, slugOrId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as IndieGame;
    }

    const q = query(
      collection(db, INDIES_COLLECTION),
      where("slug", "==", slugOrId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as IndieGame;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar indie por slug:", error);
    return null;
  }
}

/**
 * Vota ou retira o voto de um jogo indie
 */
export async function toggleVoteIndie(
  gameId: string,
  userId: string,
  hasVoted: boolean
): Promise<void> {
  const docRef = doc(db, INDIES_COLLECTION, gameId);
  if (hasVoted) {
    await updateDoc(docRef, {
      voters: arrayRemove(userId),
      votesCount: increment(-1),
      updatedAt: new Date().toISOString(),
    });
  } else {
    await updateDoc(docRef, {
      voters: arrayUnion(userId),
      votesCount: increment(1),
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Busca todos os jogos indies em destaque aprovados para um local específico.
 * Considera expiração (spotlightUntil) e ordena por prioridade decrescente.
 */
export async function fetchSpotlightIndies(
  location: IndieSpotlightLocation
): Promise<IndieGame[]> {
  try {
    const q = query(
      collection(db, INDIES_COLLECTION),
      where("status", "==", "approved"),
      where("isSpotlight", "==", true)
    );
    const snap = await getDocs(q);
    const now = new Date().toISOString();
    
    const indies = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as IndieGame))
      .filter((g) => {
        // Verifica se inclui a localização
        const matchesLoc = g.spotlightLocations && g.spotlightLocations.includes(location);
        if (!matchesLoc) return false;
        // Verifica se não expirou
        if (g.spotlightUntil && g.spotlightUntil < now) return false;
        return true;
      })
      .sort((a, b) => (b.spotlightPriority || 0) - (a.spotlightPriority || 0));

    return indies;
  } catch (error) {
    console.error("Erro ao buscar destaques indie:", error);
    return [];
  }
}

/**
 * Busca o jogo indie ativo no banner de destaque para um local específico,
 * aplicando rodízio temporal entre os jogos elegíveis de maior prioridade.
 */
export async function fetchSpotlightIndie(
  location: IndieSpotlightLocation
): Promise<IndieGame | null> {
  try {
    const indies = await fetchSpotlightIndies(location);
    if (indies.length === 0) return null;
    if (indies.length === 1) return indies[0];

    // Rodízio automático: agrupa pelos de maior prioridade e alterna baseado no tempo (ou aleatório ponderado)
    const highestPriority = indies[0].spotlightPriority || 0;
    const topTier = indies.filter((g) => (g.spotlightPriority || 0) === highestPriority);

    // Alterna a cada 10 segundos ou por carregamento de página
    const randomIndex = Math.floor(Math.random() * topTier.length);
    return topTier[randomIndex] || indies[0];
  } catch (error) {
    console.error("Erro ao buscar spotlight indie:", error);
    return null;
  }
}

/**
 * Comentários de um jogo indie
 */
export async function fetchIndieComments(gameId: string): Promise<IndieComment[]> {
  try {
    const q = query(
      collection(db, INDIES_COLLECTION, gameId, "comments"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IndieComment));
  } catch (error) {
    console.error("Erro ao buscar comentários do indie:", error);
    return [];
  }
}

export async function addIndieComment(
  gameId: string,
  commentData: { userId: string; userName: string; userAvatar?: string; content: string }
): Promise<void> {
  const colRef = collection(db, INDIES_COLLECTION, gameId, "comments");
  await addDoc(colRef, {
    ...commentData,
    gameId,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Funções Administrativas
 */
export async function fetchAllIndiesAdmin(): Promise<IndieGame[]> {
  try {
    const snap = await getDocs(collection(db, INDIES_COLLECTION));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IndieGame));
  } catch (error) {
    console.error("Erro ao buscar todos os indies para admin:", error);
    return [];
  }
}

/**
 * Atualiza status e, se aprovado, concede o título exclusivo ao desenvolvedor
 */
export async function updateIndieStatus(
  gameId: string,
  status: IndieGameStatus
): Promise<void> {
  const docRef = doc(db, INDIES_COLLECTION, gameId);
  const snap = await getDoc(docRef);

  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });

  if (status === "approved" && snap.exists()) {
    const game = snap.data() as IndieGame;
    if (game.submittedBy) {
      try {
        await grantIndieCreatorTitleToUser(game.submittedBy);
      } catch (err) {
        console.warn("Erro ao atribuir título exclusivo ao autor do jogo:", err);
      }
    }
  }
}

export async function updateIndieSpotlight(
  gameId: string,
  isSpotlight: boolean,
  spotlightLocations: IndieSpotlightLocation[],
  options?: {
    priority?: number;
    until?: string | null;
  }
): Promise<void> {
  const docRef = doc(db, INDIES_COLLECTION, gameId);
  const updates: Record<string, any> = {
    isSpotlight,
    spotlightLocations,
    updatedAt: new Date().toISOString(),
  };

  if (options?.priority !== undefined) {
    updates.spotlightPriority = options.priority;
  }
  if (options?.until !== undefined) {
    updates.spotlightUntil = options.until || deleteField();
  }

  await updateDoc(docRef, updates);
}

export async function deleteIndieGame(gameId: string): Promise<void> {
  const docRef = doc(db, INDIES_COLLECTION, gameId);
  await deleteDoc(docRef);
}
