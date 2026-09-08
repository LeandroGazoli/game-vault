/**
 * Plano de conteúdo da gamificação — 37 conquistas, 8 missões de temporada, 24 diárias.
 *
 * Este arquivo é só DADO: edite títulos, alvos e XP aqui e rode `npm run seed:gamification`.
 * Os ids são derivados de `<prefixo>-<metric>-<targetValue>`, então re-rodar o seed
 * ATUALIZA as definições existentes em vez de duplicar — o que importa porque
 * `users/{uid}.claimedRewards` guarda o id da definição já paga.
 *
 * Métricas válidas: completed | hours | library | rated | playing | level
 * Ícones: qualquer nome de GAMIFICATION_ICONS (src/lib/gamification.ts).
 */

/** Prefixo dos ids da temporada. TROQUE a cada nova temporada para os alvos valerem de novo. */
export const SEASON_SLUG = "s1";

export const SEASON_NAME = "Temporada 1 · Reset de Save";

/** Quantas missões do pool diário aparecem por dia (system/gamification.dailyRotationCount). */
export const DAILY_ROTATION_COUNT = 3;

// ==========================================
// CONQUISTAS — 6 trilhas de raridade + 6 secretas
// ==========================================

export const ACHIEVEMENTS = [
  // Trilha I · Créditos Finais (completed)
  { metric: "completed", targetValue: 1,    rewardXp: 40,   globalRarity: 82,  iconName: "Trophy", title: "Primeiro Crédito Final", description: "Zere seu primeiro jogo e veja os créditos subirem." },
  { metric: "completed", targetValue: 5,    rewardXp: 100,  globalRarity: 54,  iconName: "Medal",  title: "Colecionador de Finais", description: "Cinco campanhas encerradas. Virou hábito." },
  { metric: "completed", targetValue: 10,   rewardXp: 200,  globalRarity: 33,  iconName: "Award",  title: "Caçador de Platinas",    description: "Dez jogos zerados. O backlog começou a temer." },
  { metric: "completed", targetValue: 25,   rewardXp: 400,  globalRarity: 16,  iconName: "Swords", title: "Devorador de Campanhas", description: "25 finais no currículo." },
  { metric: "completed", targetValue: 50,   rewardXp: 800,  globalRarity: 6,   iconName: "Crown",  title: "Mestre dos Finais",      description: "50 jogos zerados. Isso é dedicação de ofício." },
  { metric: "completed", targetValue: 100,  rewardXp: 1600, globalRarity: 1.5, iconName: "Skull",  title: "Lorde do Backlog",       description: "100 jogos zerados. Pouca gente chega aqui." },

  // Trilha II · Tempo de Tela (hours)
  { metric: "hours", targetValue: 10,   rewardXp: 30,   globalRarity: 88, iconName: "Clock",  title: "Aquecendo os Dedos",  description: "10 horas registradas na sua biblioteca." },
  { metric: "hours", targetValue: 100,  rewardXp: 100,  globalRarity: 58, iconName: "Flame",  title: "Maratonista",         description: "100 horas de jogo somadas." },
  { metric: "hours", targetValue: 500,  rewardXp: 250,  globalRarity: 28, iconName: "Ghost",  title: "Insônia Programada",  description: "500 horas. O sofá já tem sua marca." },
  { metric: "hours", targetValue: 1000, rewardXp: 500,  globalRarity: 13, iconName: "Zap",    title: "Mil Horas de Glória", description: "1.000 horas registradas." },
  { metric: "hours", targetValue: 2500, rewardXp: 1000, globalRarity: 5,  iconName: "Rocket", title: "Vida Paralela",       description: "2.500 horas. Praticamente um segundo emprego." },
  { metric: "hours", targetValue: 5000, rewardXp: 2000, globalRarity: 1,  iconName: "Gem",    title: "Cronomante",          description: "5.000 horas. Você dobra o tempo." },

  // Trilha III · O Acervo (library)
  { metric: "library", targetValue: 5,   rewardXp: 30,   globalRarity: 90,  iconName: "Bookmark", title: "Primeira Estante",    description: "5 jogos cadastrados no Vault." },
  { metric: "library", targetValue: 25,  rewardXp: 80,   globalRarity: 62,  iconName: "Shield",   title: "Cofre Recheado",      description: "25 jogos no seu acervo." },
  { metric: "library", targetValue: 50,  rewardXp: 180,  globalRarity: 38,  iconName: "Star",     title: "Curador de Acervo",   description: "50 jogos organizados." },
  { metric: "library", targetValue: 100, rewardXp: 350,  globalRarity: 19,  iconName: "Map",      title: "Bibliotecário Gamer", description: "100 jogos no Vault." },
  { metric: "library", targetValue: 250, rewardXp: 700,  globalRarity: 6,   iconName: "Gem",      title: "Arquivista Supremo",  description: "250 jogos catalogados." },
  { metric: "library", targetValue: 500, rewardXp: 1400, globalRarity: 1.2, iconName: "Crown",    title: "Guardião do Vault",   description: "500 jogos. Seu acervo virou museu." },

  // Trilha IV · Painel do Crítico (rated)
  { metric: "rated", targetValue: 1,  rewardXp: 30,  globalRarity: 76, iconName: "Star",     title: "Primeira Nota",     description: "Avalie um jogo da sua biblioteca." },
  { metric: "rated", targetValue: 5,  rewardXp: 80,  globalRarity: 48, iconName: "Heart",    title: "Voz da Comunidade", description: "5 avaliações registradas." },
  { metric: "rated", targetValue: 10, rewardXp: 160, globalRarity: 26, iconName: "Award",    title: "Crítico Exigente",  description: "10 avaliações. Sua opinião pesa." },
  { metric: "rated", targetValue: 20, rewardXp: 320, globalRarity: 11, iconName: "Sparkles", title: "Selo de Qualidade", description: "20 avaliações. Nota máxima em rigor." },

  // Trilha V · Pratos Girando (playing)
  { metric: "playing", targetValue: 1,  rewardXp: 25,  globalRarity: 91, iconName: "Gamepad2", title: "Mão na Massa",         description: "Um jogo em andamento." },
  { metric: "playing", targetValue: 3,  rewardXp: 60,  globalRarity: 57, iconName: "Dices",    title: "Multitarefa",          description: "Três jogos em andamento ao mesmo tempo." },
  { metric: "playing", targetValue: 5,  rewardXp: 140, globalRarity: 30, iconName: "Joystick", title: "Malabarista de Saves", description: "Cinco jogos em andamento. Alguém aí lembra os controles?" },
  { metric: "playing", targetValue: 10, rewardXp: 300, globalRarity: 9,  iconName: "Bomb",     title: "Caos Organizado",      description: "Dez jogos em andamento simultâneos." },

  // Trilha VI · Prestígio (level) — espelha os rankTitle de calculateGamerLevel
  { metric: "level", targetValue: 5,  rewardXp: 50,   globalRarity: 70,  iconName: "Target",   title: "Recruta Registrado", description: "Alcance o nível 5." },
  { metric: "level", targetValue: 15, rewardXp: 150,  globalRarity: 42,  iconName: "Compass",  title: "Aventureiro PRO",    description: "Alcance o nível 15 e o título de Aventureiro PRO." },
  { metric: "level", targetValue: 30, rewardXp: 400,  globalRarity: 18,  iconName: "Swords",   title: "Veterano Hardcore",  description: "Alcance o nível 30." },
  { metric: "level", targetValue: 50, rewardXp: 900,  globalRarity: 5,   iconName: "Crown",    title: "Mestre Lendário",    description: "Alcance o nível 50." },
  { metric: "level", targetValue: 80, rewardXp: 2000, globalRarity: 0.5, iconName: "Sparkles", title: "Lorde Supremo",      description: "Alcance o nível 80." },

  // Secretas — título e descrição ocultos até desbloquear
  { metric: "completed", targetValue: 15,  rewardXp: 350,  globalRarity: 22, iconName: "Ghost",  isSecret: true, title: "Zerador Silencioso",   description: "Zerou 15 jogos sem alarde." },
  { metric: "playing",   targetValue: 7,   rewardXp: 300,  globalRarity: 8,  iconName: "Puzzle", isSecret: true, title: "Sem Fim à Vista",      description: "7 jogos em andamento ao mesmo tempo. Escolha um." },
  { metric: "library",   targetValue: 150, rewardXp: 400,  globalRarity: 13, iconName: "Dices",  isSecret: true, title: "Compra por Impulso",   description: "150 jogos no Vault. A promoção venceu você." },
  { metric: "hours",     targetValue: 750, rewardXp: 300,  globalRarity: 21, iconName: "Skull",  isSecret: true, title: "Madrugada Nível Boss", description: "750 horas registradas." },
  { metric: "rated",     targetValue: 15,  rewardXp: 250,  globalRarity: 18, iconName: "Heart",  isSecret: true, title: "Júri Implacável",      description: "15 avaliações publicadas." },
  { metric: "level",     targetValue: 60,  rewardXp: 1200, globalRarity: 2,  iconName: "Gem",    isSecret: true, title: "Lenda do Vault",       description: "Nível 60 alcançado." },
];

// ==========================================
// MISSÕES DE TEMPORADA — janela de 90 dias
// ==========================================

export const SEASON_MISSIONS = [
  { metric: "completed", targetValue: 3,   rewardXp: 150, iconName: "Flame",    title: "Aquecimento da Temporada", description: "Zere 3 jogos durante a temporada." },
  { metric: "library",   targetValue: 30,  rewardXp: 150, iconName: "Bookmark", title: "Estante em Obras",         description: "Chegue a 30 jogos no Vault." },
  { metric: "rated",     targetValue: 8,   rewardXp: 180, iconName: "Star",     title: "Voz Ativa",                description: "Deixe 8 avaliações." },
  { metric: "playing",   targetValue: 4,   rewardXp: 200, iconName: "Dices",    title: "Ritmo de Jogo",            description: "Mantenha 4 jogos em andamento." },
  { metric: "hours",     targetValue: 250, rewardXp: 250, iconName: "Clock",    title: "Meia Maratona",            description: "Acumule 250 horas jogadas." },
  { metric: "level",     targetValue: 12,  rewardXp: 300, iconName: "Target",   title: "Subindo de Patente",       description: "Alcance o nível 12." },
  { metric: "completed", targetValue: 12,  rewardXp: 400, iconName: "Trophy",   title: "Fecha-Campanha",           description: "Chegue a 12 jogos zerados." },
  { metric: "level",     targetValue: 25,  rewardXp: 600, iconName: "Crown",    title: "Elite da Temporada",       description: "Alcance o nível 25 antes do fim da temporada." },
];

// ==========================================
// POOL DIÁRIO — 24 missões, 3 sorteadas por dia
// ==========================================

export const DAILY_MISSIONS = [
  // Ritmo
  { metric: "playing",   targetValue: 1,  rewardXp: 20, iconName: "Gamepad2",     title: "Bota pra Rodar",        description: "Tenha ao menos 1 jogo em andamento." },
  { metric: "playing",   targetValue: 2,  rewardXp: 25, iconName: "Swords",       title: "Dois na Agulha",        description: "Mantenha 2 jogos em andamento." },
  { metric: "playing",   targetValue: 3,  rewardXp: 30, iconName: "Dices",        title: "Trio de Ferro",         description: "Mantenha 3 jogos em andamento." },
  { metric: "playing",   targetValue: 5,  rewardXp: 45, iconName: "Bomb",         title: "Cinco Frentes Abertas", description: "Mantenha 5 jogos em andamento." },
  { metric: "completed", targetValue: 1,  rewardXp: 25, iconName: "CheckCircle2", title: "Primeiro Final",        description: "Tenha 1 jogo zerado." },
  { metric: "completed", targetValue: 2,  rewardXp: 30, iconName: "Medal",        title: "Dobradinha",            description: "Chegue a 2 jogos zerados." },
  { metric: "completed", targetValue: 4,  rewardXp: 40, iconName: "Trophy",       title: "Trinca e Meia",         description: "Chegue a 4 jogos zerados." },
  { metric: "completed", targetValue: 8,  rewardXp: 55, iconName: "Flame",        title: "Sequência Vencedora",   description: "Chegue a 8 jogos zerados." },

  // Acervo
  { metric: "library", targetValue: 3,  rewardXp: 20, iconName: "Bookmark", title: "Um a Mais no Cofre",     description: "Chegue a 3 jogos no Vault." },
  { metric: "library", targetValue: 8,  rewardXp: 25, iconName: "Gem",      title: "Estante Ganhando Corpo", description: "Chegue a 8 jogos no Vault." },
  { metric: "library", targetValue: 15, rewardXp: 30, iconName: "Shield",   title: "Quinze no Vault",        description: "Chegue a 15 jogos no Vault." },
  { metric: "library", targetValue: 30, rewardXp: 40, iconName: "Crown",    title: "Coleção Respeitável",    description: "Chegue a 30 jogos no Vault." },
  { metric: "library", targetValue: 45, rewardXp: 50, iconName: "Compass",  title: "Caça ao Backlog",        description: "Chegue a 45 jogos no Vault." },
  { metric: "library", targetValue: 60, rewardXp: 60, iconName: "Map",      title: "Cofre Lotado",           description: "Chegue a 60 jogos no Vault." },

  // Crítico
  { metric: "rated", targetValue: 1,  rewardXp: 20, iconName: "Star",     title: "Deixa a Nota",    description: "Avalie 1 jogo." },
  { metric: "rated", targetValue: 4,  rewardXp: 25, iconName: "Heart",    title: "Opinião Formada", description: "Chegue a 4 avaliações." },
  { metric: "rated", targetValue: 8,  rewardXp: 35, iconName: "Award",    title: "Curador do Dia",  description: "Chegue a 8 avaliações." },
  { metric: "rated", targetValue: 12, rewardXp: 45, iconName: "Sparkles", title: "Painel Completo", description: "Chegue a 12 avaliações." },

  // Horas & Nível
  { metric: "hours", targetValue: 10,  rewardXp: 20, iconName: "Clock",    title: "Dez na Conta",    description: "Registre 10 horas jogadas." },
  { metric: "hours", targetValue: 50,  rewardXp: 25, iconName: "Clock",    title: "Sessão Longa",    description: "Registre 50 horas jogadas." },
  { metric: "hours", targetValue: 100, rewardXp: 35, iconName: "Zap",      title: "Century",         description: "Registre 100 horas jogadas." },
  { metric: "hours", targetValue: 200, rewardXp: 45, iconName: "Rocket",   title: "Turno Duplo",     description: "Registre 200 horas jogadas." },
  { metric: "level", targetValue: 3,   rewardXp: 25, iconName: "Target",   title: "Subindo a Régua", description: "Alcance o nível 3." },
  { metric: "level", targetValue: 8,   rewardXp: 40, iconName: "Joystick", title: "Patente Nova",    description: "Alcance o nível 8." },
];
