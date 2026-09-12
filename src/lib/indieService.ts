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
} from "firebase/firestore";
import {
  IndieGame,
  IndieComment,
  IndieSubmissionForm,
  IndieSpotlightLocation,
  IndieGameStatus,
} from "./types/indie.types";

const INDIES_COLLECTION = "indie_games";

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
 * Submete um jogo indie para moderação
 */
export async function submitIndieGame(
  data: IndieSubmissionForm,
  userId: string
): Promise<string> {
  const baseSlug = slugify(data.title);
  const docId = `indie-${Date.now()}`;
  const now = new Date().toISOString();

  const newGame: IndieGame = {
    ...data,
    id: docId,
    slug: `${baseSlug}-${docId.slice(-4)}`,
    status: "pending",
    votesCount: 0,
    voters: [],
    isSpotlight: false,
    spotlightLocations: [],
    submittedBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = doc(db, INDIES_COLLECTION, docId);
  await setDoc(docRef, newGame);
  return docId;
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
 * Busca o jogo indie ativo no banner de destaque para um local específico
 */
export async function fetchSpotlightIndie(
  location: IndieSpotlightLocation
): Promise<IndieGame | null> {
  try {
    const q = query(
      collection(db, INDIES_COLLECTION),
      where("status", "==", "approved"),
      where("isSpotlight", "==", true)
    );
    const snap = await getDocs(q);
    const indies = snap.docs.map((d) => ({ id: d.id, ...d.data() } as IndieGame));
    const matching = indies.find(
      (g) => g.spotlightLocations && g.spotlightLocations.includes(location)
    );
    return matching || indies[0] || null;
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

export async function updateIndieStatus(
  gameId: string,
  status: IndieGameStatus
): Promise<void> {
  const docRef = doc(db, INDIES_COLLECTION, gameId);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateIndieSpotlight(
  gameId: string,
  isSpotlight: boolean,
  spotlightLocations: IndieSpotlightLocation[]
): Promise<void> {
  const docRef = doc(db, INDIES_COLLECTION, gameId);
  await updateDoc(docRef, {
    isSpotlight,
    spotlightLocations,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteIndieGame(gameId: string): Promise<void> {
  const docRef = doc(db, INDIES_COLLECTION, gameId);
  await deleteDoc(docRef);
}
