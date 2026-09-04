import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
  limit,
  runTransaction,
  orderBy,
  onSnapshot,
  Firestore
} from "firebase/firestore";
import {
  UserGame,
  UserProfile,
  FeedbackItem,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackRewardType,
  FeedbackVote,
  FeedbackComment,
  SystemNotification
} from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCBeWB14tmyQZZddMia62SpzQ5iTRio8TI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gamevault-profile.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gamevault-profile",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gamevault-profile.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "310412819391",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:310412819391:web:b61a5616735ef4c3fdbf0a",
};

export const isFirebaseConfigured = true;

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// ==========================================
// FUNÇÕES DE PERSISTÊNCIA (FIRESTORE)
// ==========================================

export async function getUserLibrary(userId: string): Promise<UserGame[]> {
  if (!userId || !db) return [];

  try {
    const q = query(collection(db, "users", userId, "games"));
    const snapshot = await getDocs(q);
    const games: UserGame[] = [];
    snapshot.forEach((docSnap) => {
      games.push(docSnap.data() as UserGame);
    });
    return games;
  } catch (e) {
    console.error("Erro ao carregar jogos do Firestore:", e);
    return [];
  }
}

export async function saveUserGame(userId: string, game: UserGame): Promise<void> {
  if (!userId || !db) return;
  const gameDocId = String(game.gameId);
  const updatedGame = {
    ...game,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "users", userId, "games", gameDocId), updatedGame, { merge: true });
  } catch (e) {
    console.error("Erro ao salvar jogo no Firestore:", e);
  }
}

export async function removeUserGame(userId: string, gameId: string | number): Promise<void> {
  if (!userId || !db) return;
  const gameDocId = String(gameId);

  try {
    await deleteDoc(doc(db, "users", userId, "games", gameDocId));
  } catch (e) {
    console.error("Erro ao remover no Firestore:", e);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId || !db) return null;

  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (e) {
    console.error("Erro ao buscar perfil no Firestore:", e);
  }
  return null;
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  if (!username || !db) return null;

  try {
    const raw = username.trim();
    const clean = raw.toLowerCase();

    // 1. Busca por campo username (minúsculo padronizado)
    const q = query(
      collection(db, "users"),
      where("username", "==", clean),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as UserProfile;
    }

    // 2. Fallback: busca por username exato (caso tenha sido salvo com maiúsculas antigas)
    if (clean !== raw) {
      const qExact = query(
        collection(db, "users"),
        where("username", "==", raw),
        limit(1)
      );
      const snapExact = await getDocs(qExact);
      if (!snapExact.empty) {
        return snapExact.docs[0].data() as UserProfile;
      }
    }

    // 3. Fallback: verifica se o parâmetro foi um UID direto
    const directDoc = await getDoc(doc(db, "users", raw));
    if (directDoc.exists()) {
      return directDoc.data() as UserProfile;
    }
  } catch (e) {
    console.error("Erro ao buscar perfil por username no Firestore:", e);
  }
  return null;
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  if (!userId || !db) return;

  try {
    await setDoc(doc(db, "users", userId), profile, { merge: true });
  } catch (e) {
    console.error("Erro ao salvar perfil no Firestore:", e);
  }
}

// ==========================================
// FUNÇÕES DE ADMINISTRAÇÃO DA PLATAFORMA
// ==========================================

export async function getAllUsersForAdmin(): Promise<UserProfile[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "users"));
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      users.push(docSnap.data() as UserProfile);
    });
    return users;
  } catch (e) {
    console.error("Erro ao listar usuários para o admin:", e);
    return [];
  }
}

export async function updateUserPlanByAdmin(
  targetUserId: string,
  newPlan: "free" | "pro" | "vip"
): Promise<void> {
  if (!targetUserId || !db) return;
  try {
    const isPremium = newPlan === "pro" || newPlan === "vip";
    await setDoc(
      doc(db, "users", targetUserId),
      {
        plan: newPlan,
        isPremium,
        hideAds: isPremium,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Erro ao atualizar plano pelo admin:", e);
  }
}

// ==========================================
// CENTRAL DE FEEDBACK, IDEIAS & RECOMPENSAS
// ==========================================

function getSafeTime(val: any): number {
  if (!val) return 0;
  if (typeof val?.toDate === "function") return val.toDate().getTime();
  if (typeof val === "object" && typeof val.seconds === "number") return val.seconds * 1000;
  if (val instanceof Date) return val.getTime();
  const t = new Date(val).getTime();
  return isNaN(t) ? 0 : t;
}

export async function createFeedbackItem(
  data: Omit<
    FeedbackItem,
    | "id"
    | "upvotesCount"
    | "downvotesCount"
    | "score"
    | "commentsCount"
    | "status"
    | "createdAt"
    | "updatedAt"
  >
): Promise<string> {
  if (!db) throw new Error("Firestore não inicializado");
  if (!auth?.currentUser) {
    throw new Error("Você precisa estar conectado à sua conta para publicar uma sugestão.");
  }

  const currentUserId = auth.currentUser.uid;
  const feedbackCollection = collection(db, "feedback");
  const newDocRef = doc(feedbackCollection);
  const now = new Date().toISOString();

  const item: FeedbackItem = {
    ...data,
    id: newDocRef.id,
    authorId: currentUserId,
    status: "under_review",
    upvotesCount: 0,
    downvotesCount: 0,
    score: 0,
    commentsCount: 0,
    rewarded: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, item);
  return newDocRef.id;
}

export async function getFeedbackItems(options?: {
  category?: FeedbackCategory | "all";
  status?: FeedbackStatus | "all";
  sortBy?: "score" | "recent" | "comments";
  search?: string;
}): Promise<FeedbackItem[]> {
  if (!db) return [];

  try {
    const feedbackColl = collection(db, "feedback");
    const snapshot = await getDocs(feedbackColl);
    let items: FeedbackItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as FeedbackItem;
      items.push({ ...data, id: docSnap.id });
    });

    // Filtro por Categoria
    if (options?.category && options.category !== "all") {
      items = items.filter((item) => item.category === options.category);
    }

    // Filtro por Status
    if (options?.status && options.status !== "all") {
      items = items.filter((item) => item.status === options.status);
    }

    // Busca por Texto
    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.authorName?.toLowerCase().includes(q)
      );
    }

    // Ordenação
    const sortBy = options?.sortBy || "score";
    items.sort((a, b) => {
      if (sortBy === "score") {
        const scoreDiff = (b.score || 0) - (a.score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return getSafeTime(b.createdAt) - getSafeTime(a.createdAt);
      }
      if (sortBy === "recent") {
        return getSafeTime(b.createdAt) - getSafeTime(a.createdAt);
      }
      if (sortBy === "comments") {
        return (b.commentsCount || 0) - (a.commentsCount || 0);
      }
      return 0;
    });

    return items;
  } catch (e) {
    console.error("Erro ao listar feedbacks do Firestore:", e);
    return [];
  }
}

export async function getFeedbackById(feedbackId: string): Promise<FeedbackItem | null> {
  if (!feedbackId || !db) return null;
  try {
    const docSnap = await getDoc(doc(db, "feedback", feedbackId));
    if (docSnap.exists()) {
      return { ...(docSnap.data() as FeedbackItem), id: docSnap.id };
    }
  } catch (e) {
    console.error("Erro ao buscar feedback:", e);
  }
  return null;
}

export async function castFeedbackVote(
  feedbackId: string,
  userId: string,
  targetVote: 1 | -1
): Promise<{ userVote: 1 | -1 | 0; score: number; upvotes: number; downvotes: number }> {
  if (!feedbackId || !userId || !db) {
    throw new Error("Parâmetros inválidos para votação");
  }
  if (!auth?.currentUser || auth.currentUser.uid !== userId) {
    throw new Error("Você precisa estar conectado com sua conta para votar.");
  }

  const feedbackRef = doc(db, "feedback", feedbackId);
  const voteRef = doc(db, "feedback", feedbackId, "votes", userId);

  return await runTransaction(db, async (transaction) => {
    const feedbackSnap = await transaction.get(feedbackRef);
    if (!feedbackSnap.exists()) {
      throw new Error("Feedback não encontrado");
    }

    const feedbackData = feedbackSnap.data() as FeedbackItem;
    let upvotes = feedbackData.upvotesCount || 0;
    let downvotes = feedbackData.downvotesCount || 0;

    const voteSnap = await transaction.get(voteRef);
    let newUserVote: 1 | -1 | 0 = targetVote;

    if (!voteSnap.exists()) {
      // Primeiro voto deste usuário
      if (targetVote === 1) upvotes += 1;
      else downvotes += 1;

      transaction.set(voteRef, {
        vote: targetVote,
        userId,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const existingVote = voteSnap.data().vote as 1 | -1;

      if (existingVote === targetVote) {
        // Usuário clicou novamente no mesmo botão -> cancela o voto!
        newUserVote = 0;
        if (targetVote === 1) upvotes = Math.max(0, upvotes - 1);
        else downvotes = Math.max(0, downvotes - 1);

        transaction.delete(voteRef);
      } else {
        // Usuário trocou de voto (ex: de Upvote para Downvote)
        if (targetVote === 1) {
          upvotes += 1;
          downvotes = Math.max(0, downvotes - 1);
        } else {
          downvotes += 1;
          upvotes = Math.max(0, upvotes - 1);
        }

        transaction.set(voteRef, {
          vote: targetVote,
          userId,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const newScore = upvotes - downvotes;

    transaction.update(feedbackRef, {
      upvotesCount: upvotes,
      downvotesCount: downvotes,
      score: newScore,
      updatedAt: new Date().toISOString(),
    });

    return {
      userVote: newUserVote,
      score: newScore,
      upvotes,
      downvotes,
    };
  });
}

export async function getUserFeedbackVotes(
  userId: string,
  feedbackIds: string[]
): Promise<Record<string, 1 | -1>> {
  if (!userId || !feedbackIds.length || !db) return {};

  const votesMap: Record<string, 1 | -1> = {};

  try {
    const promises = feedbackIds.map(async (fId) => {
      const voteDoc = await getDoc(doc(db, "feedback", fId, "votes", userId));
      if (voteDoc.exists()) {
        const val = voteDoc.data().vote;
        if (val === 1 || val === -1) {
          votesMap[fId] = val;
        }
      }
    });

    await Promise.all(promises);
  } catch (e) {
    console.error("Erro ao carregar votos do usuário:", e);
  }

  return votesMap;
}

export async function updateFeedbackStatusAndResponse(
  feedbackId: string,
  status: FeedbackStatus,
  adminResponse?: string
): Promise<void> {
  if (!feedbackId || !db) return;

  const now = new Date().toISOString();
  const updatePayload: Partial<FeedbackItem> = {
    status,
    updatedAt: now,
  };

  if (adminResponse !== undefined) {
    updatePayload.adminResponse = adminResponse.trim() || null;
    updatePayload.adminResponseAt = adminResponse.trim() ? now : null;
  }

  await setDoc(doc(db, "feedback", feedbackId), updatePayload, { merge: true });
}

export async function grantFeedbackReward(
  feedbackId: string,
  targetUserId: string,
  reward: {
    type: FeedbackRewardType;
    customTitle?: string;
    adminNote?: string;
  }
): Promise<void> {
  if (!feedbackId || !targetUserId || !db) return;

  const now = new Date().toISOString();

  // 1. Atualiza Perfil do Usuário
  const userProfile = await getUserProfile(targetUserId);
  if (userProfile) {
    const currentTitles = userProfile.customTitles || (userProfile.customTitle ? [userProfile.customTitle] : []);
    const createdTitles = userProfile.createdCustomTitles || [];

    const titleToGrant =
      reward.customTitle?.trim() ||
      (reward.type === "vip"
        ? "🏆 VIP Bug Hunter"
        : reward.type === "pro"
        ? "💎 PRO Contribuidor"
        : "⭐ Reconhecimento Especial");

    const updatedTitles = currentTitles.includes(titleToGrant)
      ? currentTitles
      : [titleToGrant, ...currentTitles].slice(0, 5);

    const updatedCreatedTitles = createdTitles.includes(titleToGrant)
      ? createdTitles
      : [...createdTitles, titleToGrant];

    const updatedUser: Partial<UserProfile> = {
      customTitles: updatedTitles,
      createdCustomTitles: updatedCreatedTitles,
      customTitle: updatedTitles[0] || null,
      updatedAt: now,
    };

    if (reward.type === "vip") {
      updatedUser.plan = "vip";
      updatedUser.isPremium = true;
      updatedUser.hideAds = true;
    } else if (reward.type === "pro" && userProfile.plan !== "vip") {
      updatedUser.plan = "pro";
      updatedUser.isPremium = true;
      updatedUser.hideAds = true;
    }

    await saveUserProfile(targetUserId, updatedUser);
  }

  // 2. Atualiza Documento do Feedback com Metadados de Recompensa
  const feedbackUpdate: Partial<FeedbackItem> = {
    rewarded: true,
    rewardType: reward.type,
    rewardTitle:
      reward.customTitle?.trim() ||
      (reward.type === "vip" ? "Plano VIP Vitalício" : reward.type === "pro" ? "Plano PRO" : "Tag Customizada de Honra"),
    rewardGrantedAt: now,
    status: "completed",
    updatedAt: now,
  };

  if (reward.adminNote?.trim()) {
    feedbackUpdate.adminResponse = reward.adminNote.trim();
    feedbackUpdate.adminResponseAt = now;
  }

  await setDoc(doc(db, "feedback", feedbackId), feedbackUpdate, { merge: true });
}

export async function addFeedbackComment(
  feedbackId: string,
  commentData: Omit<FeedbackComment, "id" | "createdAt">
): Promise<string> {
  if (!feedbackId || !db) throw new Error("Parâmetros inválidos");
  if (!auth?.currentUser || auth.currentUser.uid !== commentData.authorId) {
    throw new Error("Você precisa estar conectado com sua conta para comentar.");
  }

  const commentsColl = collection(db, "feedback", feedbackId, "comments");
  const newCommentRef = doc(commentsColl);
  const now = new Date().toISOString();

  const comment: FeedbackComment = {
    ...commentData,
    id: newCommentRef.id,
    feedbackId,
    createdAt: now,
  };

  await setDoc(newCommentRef, comment);

  // Atualiza contador de comentários no documento principal
  const feedbackDoc = await getDoc(doc(db, "feedback", feedbackId));
  if (feedbackDoc.exists()) {
    const currentCount = feedbackDoc.data().commentsCount || 0;
    await setDoc(
      doc(db, "feedback", feedbackId),
      { commentsCount: currentCount + 1, updatedAt: now },
      { merge: true }
    );
  }

  return newCommentRef.id;
}

export async function getFeedbackComments(feedbackId: string): Promise<FeedbackComment[]> {
  if (!feedbackId || !db) return [];

  try {
    const commentsColl = collection(db, "feedback", feedbackId, "comments");
    const snapshot = await getDocs(commentsColl);
    const comments: FeedbackComment[] = [];

    snapshot.forEach((docSnap) => {
      comments.push(docSnap.data() as FeedbackComment);
    });

    comments.sort(
      (a, b) => getSafeTime(a.createdAt) - getSafeTime(b.createdAt)
    );

    return comments;
  } catch (e) {
    console.error("Erro ao buscar comentários do feedback:", e);
    return [];
  }
}

export async function deleteFeedbackItem(feedbackId: string): Promise<void> {
  if (!feedbackId || !db) return;
  try {
    await deleteDoc(doc(db, "feedback", feedbackId));
  } catch (e) {
    console.error("Erro ao deletar feedback:", e);
    throw e;
  }
}

// ==========================================
// SISTEMA DE NOTIFICAÇÕES (PUSH & IN-APP)
// ==========================================

export async function createSystemNotification(
  data: Omit<SystemNotification, "id" | "createdAt">
): Promise<string> {
  if (!db) throw new Error("Firestore não inicializado");

  const notifColl = collection(db, "system_notifications");
  const newDocRef = doc(notifColl);
  const now = new Date().toISOString();

  const notification: SystemNotification = {
    ...data,
    id: newDocRef.id,
    createdAt: now,
  };

  await setDoc(newDocRef, notification);
  return newDocRef.id;
}

export async function getSystemNotifications(limitCount = 30): Promise<SystemNotification[]> {
  if (!db) return [];

  try {
    const notifColl = collection(db, "system_notifications");
    const snapshot = await getDocs(notifColl);
    const list: SystemNotification[] = [];

    snapshot.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as SystemNotification), id: docSnap.id });
    });

    list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return list.slice(0, limitCount);
  } catch (e) {
    console.error("Erro ao carregar notificações do sistema:", e);
    return [];
  }
}

export async function deleteSystemNotification(id: string): Promise<void> {
  if (!id || !db) return;
  try {
    await deleteDoc(doc(db, "system_notifications", id));
  } catch (e) {
    console.error("Erro ao excluir notificação:", e);
    throw e;
  }
}

export function subscribeToSystemNotifications(
  callback: (notifications: SystemNotification[]) => void
): () => void {
  if (!db) {
    callback([]);
    return () => {};
  }

  try {
    const notifColl = collection(db, "system_notifications");
    return onSnapshot(
      notifColl,
      (snapshot) => {
        const list: SystemNotification[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as SystemNotification), id: docSnap.id });
        });
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(list);
      },
      (error) => {
        console.error("Erro no listener de notificações:", error);
      }
    );
  } catch (err) {
    console.error("Erro ao assinar notificações:", err);
    return () => {};
  }
}


