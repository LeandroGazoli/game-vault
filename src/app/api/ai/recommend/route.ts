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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da IA (GEMINI_API_KEY) não configurada no servidor." },
        { status: 500 }
      );
    }

    // 2. Chamada oficial à API REST do Google Gemini (gemini-1.5-flash) com cota 100% gratuita
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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("[Gemini AI Error]:", geminiResponse.status, errorText);

      // Tratamento para limite de taxa (cota gratuita)
      if (geminiResponse.status === 429) {
        return NextResponse.json(
          { error: "A IA está recebendo muitas consultas no momento. Aguarde alguns segundos e tente novamente!" },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Falha na comunicação com a inteligência artificial." },
        { status: 502 }
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
      parsedResult = JSON.parse(candidateText);
    } catch {
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
