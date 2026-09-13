export interface ArticleRewriteInput {
  title: string;
  content: string;
  sourceName?: string;
  sourceUrl?: string;
  targetTone?: "jornalistico" | "opinativo" | "guia";
}

export interface ArticleRewriteOutput {
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  category: "guias" | "analises" | "listas" | "especiais" | "industria";
  tags: string[];
  readTimeMinutes: number;
  contentHtml: string;
}

const CANDIDATE_MODELS = [
  { version: "v1beta", model: "gemini-2.5-flash" },
  { version: "v1beta", model: "gemini-2.0-flash" },
  { version: "v1beta", model: "gemini-2.0-flash-lite" },
  { version: "v1beta", model: "gemini-3.5-flash-lite" },
  { version: "v1beta", model: "gemini-3.6-flash" },
  { version: "v1", model: "gemini-1.5-flash" },
];

export async function rewriteArticleWithAI(input: ArticleRewriteInput): Promise<ArticleRewriteOutput> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Chave GEMINI_API_KEY não configurada no servidor.");
  }

  const systemInstruction = `Você é o editor-chefe e jornalista sênior de videogames do portal Game Vault / MyGameList.
Sua missão é transformar informações brutas, notícias importadas ou resumos em uma MATÉRIA 100% INÉDITA, AUTORAL, ENVOLVENTE E PROFISSIONAL em Português do Brasil (PT-BR).

REGRAS INEGOCIÁVEIS DE REDAÇÃO E COMPLIANCE ADSENSE:
1. ORIGINALIDADE ABSOLUTA: Nunca copie frases literais do original. Reescreva tudo com estilo editorial dinâmico, moderno e cativante para a comunidade gamer.
2. FIDELIDADE FACTUAL: Mantenha todos os dados verdadeiros intactos (nomes de jogos, estúdios, plataformas, datas, citações reais e números).
3. ESTRUTURA DO CONTEÚDO (HTML):
   - O corpo (contentHtml) DEVE ser formatado com tags HTML semânticas e limpas: <h2> para seções principais, <p> para parágrafos bem desenvolvidos (mínimo de 3 a 5 parágrafos substanciais), <blockquote> para declarações de desenvolvedores ou pontos de destaque, e <ul><li> quando cabível.
   - Não use marcação markdown (# ou **) dentro do HTML. Apenas HTML direto.
4. METADADOS SEO:
   - "title": Título cativante, sem clickbait barato, otimizado para o Google Notícias e Discover (até 80 caracteres).
   - "subtitle": Subtítulo jornalístico refinado contextualizando o tema em 1 frase.
   - "slug": Slug limpo em kebab-case correspondente ao título (sem acentos).
   - "excerpt": Resumo de 2 linhas focado em atrair o clique nos cards da home.
   - "category": Deve ser uma das opções: "guias", "analises", "listas", "especiais" ou "industria".
   - "tags": Lista de 3 a 5 tags relevantes (ex: ["PlayStation", "Trailer", "Persona 4"]).
   - "readTimeMinutes": Estimativa de leitura calculada pelo volume textual (entre 3 e 8 min).

ESTRUTURA DE RESPOSTA (ESTRITAMENTE JSON):
{
  "title": "...",
  "subtitle": "...",
  "slug": "...",
  "excerpt": "...",
  "category": "industria",
  "tags": ["Tag 1", "Tag 2"],
  "readTimeMinutes": 4,
  "contentHtml": "<h2>...</h2><p>...</p><p>...</p>"
}`;

  const promptUser = `Matéria Original para Reescrita:
Título Original: ${input.title}
${input.sourceName ? `Fonte Original: ${input.sourceName} (${input.sourceUrl || ""})` : ""}
Conteúdo/Descrição Original:
${input.content}

Reescreva a matéria agora gerando um texto completo, fluido e autoral em PT-BR no formato JSON solicitado.`;

  const requestBody = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [
          { text: systemInstruction },
          { text: promptUser },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  let geminiResponse: Response | null = null;
  let lastError = "";

  for (const candidate of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/${candidate.version}/models/${candidate.model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (res.ok) {
        geminiResponse = res;
        break;
      }

      const errText = await res.text();
      lastError = `[${candidate.model}] ${res.status}: ${errText}`;
      if (res.status === 404) continue;
      if (res.status === 429) {
        throw new Error("Limite de requisições temporário atingido na IA. Aguarde alguns instantes.");
      }
    } catch (e: any) {
      if (e.message?.includes("Limite de requisições")) throw e;
      lastError = e?.message || "Erro de conexão";
    }
  }

  if (!geminiResponse || !geminiResponse.ok) {
    throw new Error(`Falha ao comunicar com os modelos de IA: ${lastError}`);
  }

  const jsonResult = await geminiResponse.json();
  const rawText = jsonResult.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("A IA não retornou o texto da reescrita.");
  }

  let cleanJson = rawText.trim();
  if (cleanJson.startsWith("```json")) {
    cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  } else if (cleanJson.startsWith("```")) {
    cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }

  const parsed: ArticleRewriteOutput = JSON.parse(cleanJson);
  return parsed;
}
