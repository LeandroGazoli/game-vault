import { NextRequest, NextResponse } from "next/server";
import { getSystemSettings } from "@/lib/firebase";
import { searchAndFilterGamesIGDB } from "@/lib/igdbApi";
import { Game } from "@/lib/types";

export const dynamic = "force-dynamic";

// Cache em memória para evitar chamadas duplicadas à API Gemini
const aiRecommendationCache = new Map<string, { games: Game[]; explanation: string; timestamp: number }>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas de cache

export async function POST(request: NextRequest) {
  try {
    // 1. Verifica se a feature flag 'aiRecommendations' está ativa no Admin
    const settings = await getSystemSettings();
    if (!settings.features?.aiRecommendations) {
      return NextResponse.json(
        { error: "O assistente de IA está temporariamente desativado nas configurações da plataforma." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const prompt = (body.prompt || "").trim();

    if (!prompt || prompt.length < 3) {
      return NextResponse.json(
        { error: "Digite uma descrição ou estilo de jogo para receber recomendações." },
        { status: 400 }
      );
    }

    // Sanitização de chave de cache
    const cacheKey = prompt.toLowerCase();
    const cached = aiRecommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        games: cached.games,
        explanation: cached.explanation,
        fromCache: true,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da IA (GEMINI_API_KEY) não configurada no servidor." },
        { status: 500 }
      );
    }

    // 2. Chamada oficial à API REST do Google Gemini com fallback inteligente de modelos (100% gratuito)
    const systemPrompt = `Você é o curador especialista em videogames da plataforma MyGameList.
O usuário vai descrever o que deseja jogar (gênero, clima, mecânicas, similaridade com outros jogos, tempo disponível, etc).
Sua missão:
1. Recomendar entre 3 a 5 jogos existentes consagrados ou aclamados que combinem com o pedido.
2. Escrever uma justificativa empolgante, curta e amigável em português (máximo 2 a 3 frases) explicando a curadoria.
3. Fornecer os títulos exatos dos jogos em inglês/oficial para cruzarmos com o banco de dados.

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "explanation": "Texto curto explicando por que esses jogos combinam com o pedido...",
  "recommendedTitles": ["Nome Exato do Jogo 1", "Nome Exato do Jogo 2", "Nome Exato do Jogo 3"]
}`;

    const requestBody = JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `Pedido do Jogador: "${prompt}"` },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    // Modelos com cota 100% gratuita no Google AI Studio (ordenados por prioridade e compatibilidade de API)
    const CANDIDATE_MODELS = [
      { version: "v1beta", model: "gemini-2.0-flash" },
      { version: "v1beta", model: "gemini-2.0-flash-lite" },
      { version: "v1", model: "gemini-1.5-flash" },
      { version: "v1beta", model: "gemini-1.5-flash-latest" },
      { version: "v1beta", model: "gemini-1.5-flash" },
    ];

    let geminiResponse: Response | null = null;
    let lastErrorText = "";
    let lastStatusCode = 502;

    for (const candidate of CANDIDATE_MODELS) {
      const geminiUrl = `https://generativelanguage.googleapis.com/${candidate.version}/models/${candidate.model}:generateContent?key=${apiKey}`;

      try {
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        });

        if (res.ok) {
          geminiResponse = res;
          break;
        }

        const errorBody = await res.text();
        lastStatusCode = res.status;
        lastErrorText = errorBody;
        console.warn(`[Gemini AI ${candidate.model} (${candidate.version})] Falhou com status ${res.status}:`, errorBody);

        // Se 404 (modelo não suportado nesta versão de endpoint), tenta o próximo modelo
        if (res.status === 404) {
          continue;
        }

        // Se 429 (Rate Limit atingido na cota gratuita)
        if (res.status === 429) {
          return NextResponse.json(
            { error: "A IA está recebendo muitas consultas no momento. Aguarde alguns segundos e tente novamente!" },
            { status: 429 }
          );
        }

        // Se 400 ou 403 (chave inválida ou erro de permissão)
        if (res.status === 400 || res.status === 403) {
          let parsed: any = null;
          try {
            parsed = JSON.parse(errorBody);
          } catch {}
          const errorMsg = parsed?.error?.message || errorBody;

          if (errorMsg.includes("API key not valid") || errorMsg.includes("API_KEY_INVALID")) {
            return NextResponse.json(
              { error: "A chave GEMINI_API_KEY configurada na Vercel é inválida. Por favor, gere uma nova chave gratuita no Google AI Studio." },
              { status: 401 }
            );
          }
          return NextResponse.json(
            { error: `Erro na autenticação com o Google Gemini: ${errorMsg}` },
            { status: res.status }
          );
        }
      } catch (networkErr: any) {
        lastErrorText = networkErr?.message || "Falha de rede";
        console.error(`[Gemini AI ${candidate.model}] Erro de rede:`, networkErr);
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      console.error("[Gemini AI All Candidates Failed]:", lastStatusCode, lastErrorText);
      return NextResponse.json(
        {
          error: "Falha na comunicação com a inteligência artificial.",
          details: lastErrorText ? lastErrorText.slice(0, 300) : undefined,
        },
        { status: lastStatusCode || 502 }
      );
    }

    const geminiData = await geminiResponse.json();
    const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json(
        { error: "Não foi possível gerar recomendações para este pedido." },
        { status: 500 }
      );
    }

    let parsedResult: { explanation: string; recommendedTitles: string[] };
    try {
      let cleanJson = candidateText.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```\s*$/, "");
      }
      parsedResult = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("Erro ao analisar JSON do Gemini:", parseErr, candidateText);
      return NextResponse.json(
        { error: "Erro ao processar as recomendações geradas." },
        { status: 500 }
      );
    }

    // 3. Cruzamento dos títulos recomendados pela IA com a base oficial do IGDB
    const matchedGames: Game[] = [];
    const titles = (parsedResult.recommendedTitles || []).slice(0, 5);

    for (const title of titles) {
      try {
        const results = await searchAndFilterGamesIGDB({
          query: title,
          limit: 1,
        });
        if (results && results.length > 0) {
          matchedGames.push(results[0]);
        }
      } catch (err) {
        console.warn(`Erro ao buscar jogo recomendado '${title}' no IGDB:`, err);
      }
    }

    // Salva no cache da sessão
    if (matchedGames.length > 0) {
      aiRecommendationCache.set(cacheKey, {
        games: matchedGames,
        explanation: parsedResult.explanation,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({
      games: matchedGames,
      explanation: parsedResult.explanation,
      fromCache: false,
    });
  } catch (error: any) {
    console.error("Erro interno na rota /api/ai/recommend:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar recomendações por IA." },
      { status: 500 }
    );
  }
}
