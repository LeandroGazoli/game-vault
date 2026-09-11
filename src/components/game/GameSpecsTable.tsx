import React from "react";
import Link from "next/link";
import {
  Monitor,
  Building2,
  Globe,
  Tags,
  Search,
  Gamepad2,
  Languages,
  Users,
  Eye,
} from "lucide-react";
import { Game } from "@/lib/types";
import {
  translateGenre,
  translateGameMode,
  translatePlayerPerspective,
  getCategoryHubUrl,
} from "@/lib/gameUtils";
import { getAgeRatingBadge } from "./gameDetailHelpers";

interface GameSpecsTableProps {
  game: Game;
  isAdult?: boolean;
}

export default function GameSpecsTable({ game, isAdult }: GameSpecsTableProps) {
  return (
    <div className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#18191c] p-5 sm:p-6 space-y-5 shadow-xl">
      <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
        <Monitor className="w-4 h-4 text-emerald-400" /> Ficha Técnica
      </h3>

      {/* FICHA TÉCNICA KEY-VALUE COMPACTA (Estilo Prints 2, 3 e 4) */}
      <div className="rounded-2xl bg-[#11141c] border border-white/[0.08] p-4 divide-y divide-white/[0.06] text-xs">
        {/* Linha 1: Gênero Principal */}
        {game.genres && game.genres[0] && (
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400 font-medium">Gênero Principal</span>
            <span className="text-white font-bold">{translateGenre(game.genres[0].name)}</span>
          </div>
        )}

        {/* Linha 2: Lançamento */}
        {game.released && (
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400 font-medium">Data de Lançamento</span>
            <span className="text-white font-mono font-bold">
              {new Date(game.released).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Linha 3: Desenvolvedora */}
        {game.developers && game.developers[0] && (
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400 font-medium">Desenvolvedora</span>
            <span className="text-emerald-400 font-bold">{game.developers[0]}</span>
          </div>
        )}

        {/* Linha 4: Publicadora */}
        {game.publishers && game.publishers[0] && (
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400 font-medium">Distribuidora</span>
            <span className="text-neutral-200 font-medium">{game.publishers[0]}</span>
          </div>
        )}

        {/* Linha 5: Duração HLTB */}
        {game.hltb?.mainStory ? (
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400 font-medium flex items-center gap-1">
              <span>Campanha (HLTB)</span>
              <span className="text-[10px] text-neutral-500" title="HowLongToBeat">
                ⓘ
              </span>
            </span>
            <span className="text-cyan-400 font-mono font-bold">{game.hltb.mainStory} horas</span>
          </div>
        ) : null}

        {/* Linha 6: Classificação Indicativa */}
        <div className="flex items-center justify-between py-2">
          <span className="text-neutral-400 font-medium">Classificação</span>
          <div>{getAgeRatingBadge(game.age_ratings, isAdult) || <span className="text-neutral-400">Livre</span>}</div>
        </div>

        {/* Linha 7: Localização PT-BR */}
        {game.ptbrSupport && (
          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400 font-medium">Português (Brasil)</span>
            <span className="text-emerald-300 font-medium">
              {game.ptbrSupport.audio
                ? "Dublado & Legendado 🇧🇷"
                : game.ptbrSupport.subtitles
                ? "Legendado 🇧🇷"
                : "Interface"}
            </span>
          </div>
        )}
      </div>

      {/* Desenvolvedora & Distribuidora Detalhada */}
      {game.developers?.length || game.publishers?.length ? (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 block">Produção &amp; Distribuição:</span>
          <div className="flex flex-col gap-1.5 text-xs">
            {game.developers && game.developers.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="text-gray-400">Desenvolvedora:</span>
                <span className="text-gray-200 font-bold">
                  {game.developers.map((dev, idx) => (
                    <Link
                      key={dev}
                      href={`/search?q=${encodeURIComponent(dev)}`}
                      className="hover:text-cyan-300 hover:underline transition-colors"
                    >
                      {dev}
                      {idx < game.developers!.length - 1 ? ", " : ""}
                    </Link>
                  ))}
                </span>
              </div>
            )}
            {game.publishers && game.publishers.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-400">Publicadora:</span>
                <span className="text-gray-200 font-bold">
                  {game.publishers.map((pub, idx) => (
                    <Link
                      key={pub}
                      href={`/search?q=${encodeURIComponent(pub)}`}
                      className="hover:text-purple-300 hover:underline transition-colors"
                    >
                      {pub}
                      {idx < game.publishers!.length - 1 ? ", " : ""}
                    </Link>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Gêneros & Categorias */}
      {game.genres && game.genres.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-white/5">
          <span className="text-xs font-semibold text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tags className="w-3.5 h-3.5 text-cyan-400" /> Gêneros &amp; Categorias:
            </span>
            <span className="text-[10px] text-gray-500">Clique para buscar</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {game.genres.map((g) => {
              const { searchUrl } = getCategoryHubUrl(g.name);
              return (
                <Link
                  key={g.id}
                  href={searchUrl}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/70 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-1.5 group shadow-sm active:scale-95 cursor-pointer min-h-[36px]"
                  title={`Buscar jogos na categoria ${translateGenre(g.name)}`}
                >
                  <Search className="w-2.5 h-2.5 text-cyan-400 group-hover:text-cyan-200" />
                  <span>{translateGenre(g.name)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Plataformas */}
      <div className="space-y-2 pt-3 border-t border-white/5">
        <span className="text-xs font-semibold text-gray-400 block">Plataformas Disponíveis:</span>
        <div className="flex flex-wrap gap-1.5">
          {game.platforms && game.platforms.length > 0 ? (
            game.platforms.map((p) => (
              <Link
                key={p.platform.id}
                href={`/search?platform=${encodeURIComponent(p.platform.name)}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer min-h-[36px]"
                title={`Buscar jogos para ${p.platform.name}`}
              >
                <Gamepad2 className="w-3 h-3 text-cyan-400/70" />
                <span>{p.platform.name}</span>
              </Link>
            ))
          ) : (
            <span className="text-xs text-gray-500">Múltiplas plataformas</span>
          )}
        </div>
      </div>

      {/* Suporte a Português do Brasil */}
      {game.ptbrSupport && (
        <div className="space-y-1.5 pt-3 border-t border-white/5">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-emerald-400" /> Português (Brasil):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {game.ptbrSupport.audio && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 font-medium">
                Áudio Dublado 🇧🇷
              </span>
            )}
            {game.ptbrSupport.subtitles && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-950/40 text-blue-300 border border-blue-500/20 font-medium">
                Legendas
              </span>
            )}
            {game.ptbrSupport.interface && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-950/40 text-purple-300 border border-purple-500/20 font-medium">
                Interface &amp; Menus
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modos de Jogo & Perspectiva */}
      {((game.game_modes && game.game_modes.length > 0) ||
        (game.player_perspectives && game.player_perspectives.length > 0)) && (
        <div className="space-y-3 pt-3 border-t border-white/5">
          {game.game_modes && game.game_modes.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Modos de Jogo:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {game.game_modes.map((m) => (
                  <span
                    key={m}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-500/20"
                  >
                    {translateGameMode(m)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {game.player_perspectives && game.player_perspectives.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" /> Câmera / Perspectiva:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {game.player_perspectives.map((p) => (
                  <span
                    key={p}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/20"
                  >
                    {translatePlayerPerspective(p)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
