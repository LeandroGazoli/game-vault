import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { Article } from "./types/article.types";
import { ARTICLES_DATA } from "./articlesData";

const ARTICLES_COLLECTION = "articles";

/**
 * Busca todos os artigos salvos no Firestore
 */
export async function fetchArticlesFromFirestore(): Promise<Article[]> {
  try {
    const q = query(
      collection(db, ARTICLES_COLLECTION),
      orderBy("publishedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Article));
  } catch (error) {
    console.error("Erro ao buscar artigos do Firestore:", error);
    return [];
  }
}

/**
 * Busca um artigo pelo slug no Firestore
 */
export async function fetchArticleBySlugFromFirestore(slug: string): Promise<Article | null> {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION));
    const snap = await getDocs(q);
    const found = snap.docs.find((d) => d.data().slug === slug);
    if (!found) return null;
    return { id: found.id, ...found.data() } as Article;
  } catch (error) {
    console.error("Erro ao buscar artigo por slug no Firestore:", error);
    return null;
  }
}

/**
 * Salva ou atualiza um artigo no Firestore
 */
export async function saveArticleToFirestore(article: Article): Promise<void> {
  const docId = article.id || article.slug;
  const docRef = doc(db, ARTICLES_COLLECTION, docId);
  const dataToSave = {
    ...article,
    id: docId,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(docRef, dataToSave, { merge: true });
}

/**
 * Exclui um artigo do Firestore
 */
export async function deleteArticleFromFirestore(articleId: string): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, articleId);
  await deleteDoc(docRef);
}

/**
 * Retorna todos os artigos combinando Firestore e os artigos base estáticos
 */
export async function getCombinedArticles(): Promise<Article[]> {
  const firestoreArticles = await fetchArticlesFromFirestore();

  // Cria um mapa onde os artigos do Firestore sobrepõem os estáticos pelo slug ou id
  const map = new Map<string, Article>();

  ARTICLES_DATA.forEach((art) => {
    map.set(art.slug, art);
  });

  firestoreArticles.forEach((art) => {
    map.set(art.slug, art);
  });

  const list = Array.from(map.values());
  return list.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Retorna um artigo buscando tanto no Firestore quanto no acervo estático
 */
export async function getCombinedArticleBySlug(slug: string): Promise<Article | null> {
  const firestoreArticle = await fetchArticleBySlugFromFirestore(slug);
  if (firestoreArticle) return firestoreArticle;

  const staticArticle = ARTICLES_DATA.find((a) => a.slug === slug);
  return staticArticle || null;
}
