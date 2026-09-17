import { Article } from "./types/article.types";
import { ARTICLES_DATA } from "./articlesData";
import {
  buildReadRequest,
  firestoreDocToJs,
  getFirestoreEndpoint,
  requireGoogleAccessToken,
  jsValueToFirestore,
} from "./firestoreRest";

const ARTICLES_COLLECTION = "articles";


/**
 * Busca todos os artigos salvos no Firestore usando REST API pura (sem gRPC / protobufjs).
 */
export async function fetchArticlesFromFirestore(): Promise<Article[]> {
  try {
    const { baseUrl } = getFirestoreEndpoint();
    const articles: Article[] = [];
    let pageToken: string | undefined;

    // Percorre todas as páginas — a REST API limita cada resposta a `pageSize`.
    do {
      const endpoint = new URL(`${baseUrl}/${ARTICLES_COLLECTION}`);
      endpoint.searchParams.set("pageSize", "300");
      if (pageToken) endpoint.searchParams.set("pageToken", pageToken);

      const { url, headers } = await buildReadRequest(endpoint.toString());
      const res = await fetch(url, { method: "GET", headers });

      if (!res.ok) {
        console.error(
          "Erro ao buscar artigos do Firestore:",
          res.status,
          await res.text().catch(() => "")
        );
        break;
      }

      const data = (await res.json()) as { documents?: any[]; nextPageToken?: string };
      for (const doc of data.documents || []) {
        const parsed = firestoreDocToJs<Article>(doc);
        if (parsed) articles.push(parsed);
      }
      pageToken = data.nextPageToken;
    } while (pageToken);

    return articles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error("Erro ao buscar artigos do Firestore:", error);
    return [];
  }
}

/**
 * Busca um artigo pelo slug no Firestore usando REST API pura.
 */
export async function fetchArticleBySlugFromFirestore(slug: string): Promise<Article | null> {
  try {
    const articles = await fetchArticlesFromFirestore();
    const found = articles.find((a) => a.slug === slug);
    return found || null;
  } catch (error) {
    console.error("Erro ao buscar artigo por slug no Firestore:", error);
    return null;
  }
}

/**
 * Salva ou atualiza um artigo no Firestore usando REST API pura.
 */
export async function saveArticleToFirestore(article: Article): Promise<void> {
  const docId = article.id || article.slug;
  const { baseUrl } = getFirestoreEndpoint();
  const token = await requireGoogleAccessToken();

  const dataToSave = {
    ...article,
    id: docId,
    updatedAt: new Date().toISOString(),
  };

  const fields: Record<string, any> = {};
  const maskParams = new URLSearchParams();
  for (const [k, v] of Object.entries(dataToSave)) {
    if (v === undefined) continue;
    fields[k] = jsValueToFirestore(v);
    // updateMask preserva a semântica de setDoc(..., { merge: true })
    maskParams.append("updateMask.fieldPaths", k);
  }

  const url = `${baseUrl}/${ARTICLES_COLLECTION}/${encodeURIComponent(docId)}?${maskParams}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    throw new Error(
      `Falha ao salvar artigo (${res.status}): ${await res.text().catch(() => "")}`
    );
  }
}

/**
 * Exclui um artigo do Firestore usando REST API pura.
 */
export async function deleteArticleFromFirestore(articleId: string): Promise<void> {
  const { baseUrl } = getFirestoreEndpoint();
  const token = await requireGoogleAccessToken();

  const res = await fetch(`${baseUrl}/${ARTICLES_COLLECTION}/${encodeURIComponent(articleId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(
      `Falha ao excluir artigo (${res.status}): ${await res.text().catch(() => "")}`
    );
  }
}

/**
 * Retorna todos os artigos combinando Firestore e os artigos base estáticos
 */
export async function getCombinedArticles(): Promise<Article[]> {
  const firestoreArticles = await fetchArticlesFromFirestore();

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
