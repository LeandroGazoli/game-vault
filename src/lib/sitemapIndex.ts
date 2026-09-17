/**
 * Índice compacto das páginas de jogo, para o sitemap.
 *
 * PROBLEMA QUE RESOLVE: o sitemap varria `game_translations` inteira só para descobrir quais
 * páginas existem — 33.249 documentos, ou seja, 33.249 LEITURAS a cada geração. E isso
 * acontecia em todo `next build`, várias vezes por dia.
 *
 * Aqui a lista vive em poucos documentos agregados (`system/sitemap_index/chunks/{n}`),
 * cada um com até CHUNK_SIZE entradas. Ler o sitemap inteiro passa a custar ~7 leituras.
 *
 * O índice é mantido de forma INCREMENTAL: `saveGameTranslations` registra o jogo quando ele
 * aparece pela primeira vez (1 leitura + 1 escrita, só para jogo novo). Não há varredura
 * periódica — o custo acompanha o que de fato muda.
 */
import { getRestFirestore } from "./firestoreAdminRest";

/** Entradas por documento. 4000 × ~80 bytes fica bem abaixo do teto de 1 MiB do Firestore. */
const CHUNK_SIZE = 4000;
const INDEX_COLLECTION = "sitemap_index";
const META_DOC = "system/sitemap_index";

export interface SitemapGameEntry {
  /** id do jogo no IGDB */
  i: string;
  /** nome, usado para montar o slug */
  n: string;
  /** updatedAt ISO, para o <lastmod> */
  u?: string;
}

interface IndexMeta {
  chunkCount: number;
  entryCount: number;
  updatedAt: string;
}

function metaRef() {
  return getRestFirestore().collection("system").doc("sitemap_index");
}

function chunkRef(n: number) {
  return getRestFirestore()
    .collection("system")
    .doc("sitemap_index")
    .collection(INDEX_COLLECTION)
    .doc(String(n));
}

/** Metadados do índice (1 leitura). Usado para dimensionar as partições do sitemap. */
export async function readSitemapMeta(): Promise<{ chunkCount: number; entryCount: number }> {
  try {
    const meta = await metaRef().get();
    if (!meta.exists) return { chunkCount: 0, entryCount: 0 };
    const d = (meta.data() || {}) as IndexMeta;
    return { chunkCount: d.chunkCount ?? 0, entryCount: d.entryCount ?? 0 };
  } catch (e) {
    console.warn("[sitemapIndex] Falha ao ler meta:", e);
    return { chunkCount: 0, entryCount: 0 };
  }
}

/**
 * Lê uma FAIXA de entradas — só os chunks que a cobrem.
 *
 * O chunk 0 tem os jogos MAIS RECENTES (o bootstrap ordena por `updatedAt` desc antes de
 * fatiar), então percorrer 0→N devolve do mais novo para o mais antigo. A versão anterior
 * percorria N→0 e, com `limit`, publicava os jogos mais ANTIGOS no sitemap — o oposto do
 * pretendido.
 *
 * Custo: 1 (meta) + ceil(count / CHUNK_SIZE) leituras, e não o índice inteiro.
 */
export async function readSitemapRange(
  offset: number,
  count: number
): Promise<SitemapGameEntry[]> {
  try {
    const { chunkCount } = await readSitemapMeta();
    if (chunkCount <= 0 || count <= 0) return [];

    const firstChunk = Math.floor(offset / CHUNK_SIZE);
    const lastChunk = Math.floor((offset + count - 1) / CHUNK_SIZE);

    const out: SitemapGameEntry[] = [];
    for (let n = firstChunk; n <= Math.min(lastChunk, chunkCount - 1); n++) {
      const snap = await chunkRef(n).get();
      if (!snap.exists) continue;
      out.push(...(((snap.data() || {}) as { entries?: SitemapGameEntry[] }).entries || []));
    }

    // `out` começa no início de firstChunk; recorta para a faixa pedida.
    const start = offset - firstChunk * CHUNK_SIZE;
    return out.slice(start, start + count);
  } catch (e) {
    console.warn("[sitemapIndex] Falha ao ler faixa do índice:", e);
    return [];
  }
}

/** Compatibilidade: primeiras `limit` entradas (as mais recentes). */
export async function readSitemapIndex(limit?: number): Promise<SitemapGameEntry[]> {
  const { entryCount } = await readSitemapMeta();
  if (entryCount <= 0) return [];
  return readSitemapRange(0, limit ?? entryCount);
}

/**
 * Registra um jogo no índice, se ainda não estiver.
 * Custo: 1 leitura + 1 escrita, e SÓ quando o jogo é novo — updates de tradução não pagam.
 */
export async function registerGameInSitemapIndex(entry: SitemapGameEntry): Promise<void> {
  if (!entry?.i || !entry?.n) return;

  try {
    const meta = await metaRef().get();
    const current = (meta.data() || {}) as Partial<IndexMeta>;
    const chunkCount = current.chunkCount ?? 0;

    // Só o último chunk é consultado: jogo novo sempre entra no fim.
    const lastIndex = Math.max(0, chunkCount - 1);
    const lastSnap = chunkCount > 0 ? await chunkRef(lastIndex).get() : null;
    const entries: SitemapGameEntry[] =
      lastSnap?.exists ? ((lastSnap.data() || {}) as any).entries || [] : [];

    // Evita duplicar dentro do chunk corrente. Duplicata em chunk antigo é inofensiva:
    // o sitemap deduplica por URL na hora de montar.
    if (entries.some((e) => e.i === entry.i)) return;

    if (entries.length >= CHUNK_SIZE) {
      const newIndex = chunkCount;
      await chunkRef(newIndex).set({ entries: [entry] });
      await metaRef().set(
        {
          chunkCount: newIndex + 1,
          entryCount: (current.entryCount ?? 0) + 1,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return;
    }

    await chunkRef(lastIndex).set({ entries: [...entries, entry] }, { merge: false });
    await metaRef().set(
      {
        chunkCount: Math.max(1, chunkCount),
        entryCount: (current.entryCount ?? 0) + 1,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    // Indexação é best-effort: nunca deve derrubar o salvamento da tradução.
    console.warn("[sitemapIndex] Falha ao registrar jogo:", e);
  }
}

export { CHUNK_SIZE, META_DOC };
