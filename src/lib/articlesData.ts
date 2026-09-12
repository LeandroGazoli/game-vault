import { Article } from "./types/article.types";

export const ARTICLES_DATA: Article[] = [
  {
    id: "art-1",
    slug: "melhores-jogos-rpg-2026",
    title: "Os Melhores Jogos de RPG da Atualidade: Duração, Narrativa e Notas",
    subtitle: "Uma análise aprofundada dos RPGs mais aclamados pela crítica e como escolher sua próxima jornada épica.",
    excerpt: "Dos combates estratégicos por turnos aos mundos abertos implacáveis, confira nossa seleção definitiva de RPGs, tempos médios para zerar e diferenciais de cada obra-prima.",
    category: "guias",
    categoryLabel: "Guia Completo",
    readTimeMinutes: 7,
    publishedAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-12T14:30:00.000Z",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg",
    coverAlt: "Baldur's Gate 3 - Personagens e arte conceitual",
    featured: true,
    author: {
      name: "Leandro Gazoli",
      role: "Editor-Chefe & Fundador do MyGameList",
      avatar: "/logo-mgl.png",
      bio: "Entusiasta de RPGs ocidentais e orientais, colecionador de jogos e arquiteto de software gamer.",
    },
    tags: ["RPG", "Baldur's Gate 3", "Elden Ring", "The Witcher 3", "Metacritic", "HowLongToBeat"],
    relatedGames: [
      { id: 119171, name: "Baldur's Gate 3", slug: "baldurs-gate-3", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg", metacritic: 96, hltbMain: 65 },
      { id: 119277, name: "Elden Ring", slug: "elden-ring", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg", metacritic: 96, hltbMain: 58 },
      { id: 1942, name: "The Witcher 3: Wild Hunt", slug: "the-witcher-3-wild-hunt", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg", metacritic: 93, hltbMain: 52 },
    ],
    sections: [
      {
        heading: "A Renascença dos RPGs no Cenário Moderno",
        content: [
          "O gênero de RPG (Role-Playing Game) atingiu um nível de maturidade sem precedentes. O que antes era considerado um nicho técnico com tabelas matemáticas complexas tornou-se a vanguarda das experiências imersivas nos videogames.",
          "O grande divisor de águas reside na convergência entre liberdade de escolha moral, consequências tangíveis no mundo ao redor e uma direção de arte cinematográfica. Hoje, jogar um grande RPG não é apenas avançar por níveis, mas escrever uma biografia interativa para seu personagem.",
        ],
        callout: {
          type: "quote",
          text: "Um grande RPG não oferece respostas simples; ele confronta o jogador com dilemas onde cada escolha cobra seu preço no desfecho da campanha.",
        },
      },
      {
        heading: "Baldur's Gate 3: O Padrão Ouro da Reatividade",
        content: [
          "Lançado pela Larian Studios, Baldur's Gate 3 estabeleceu um novo patamar para os Computer RPGs (CRPGs). Inspirado nas regras da 5ª Edição de Dungeons & Dragons, o jogo oferece uma densidade de interações quase infinita.",
          "Com nota 96 no Metacritic e uma média de 65 horas dedicadas apenas à campanha principal segundo o HowLongToBeat, o título recompensa tanto jogadores táticos quanto exploradores narrativos. Cada encontro com NPCs, cada decisão de diálogo e até mesmo o ambiente físico podem ser manipulados com magia e criatividade.",
        ],
        callout: {
          type: "tip",
          text: "Dica de Backlog: Reserve blocos contínuos de pelo menos 2 a 3 horas por sessão. A densidade de narrativa de Baldur's Gate 3 exige foco para não perder nuances de missões secundárias.",
        },
      },
      {
        heading: "Elden Ring e a Liberdade Desafiadora das Terras Intermédias",
        content: [
          "A colaboração entre Hidetaka Miyazaki e George R.R. Martin transformou a fórmula tradicional dos Soulslike em um marco de mundo aberto. Diferente de jogos com mapas saturados de pontos de interrogação artificiais, Elden Ring confia no instinto visual e na curiosidade do jogador.",
          "Com mais de 58 horas para a história principal e ultrapassando 130 horas para os que buscam a conclusão total (Completionist), o jogo ensina resiliência, paciência e recompensa generosamente a exploração corajosa.",
        ],
      },
      {
        heading: "Como Escolher o RPG Ideal para o Seu Tempo Disponível",
        content: [
          "Nem todo gamer dispõe de 100 horas para dedicar a uma única obra. Antes de iniciar sua jornada, consulte os dados consolidados no MyGameList:",
          "1. Se busca foco em história sem combates punitivos: RPGs narrativos com forte ênfase em escolhas morais.",
          "2. Se tem menos de 10 horas semanais: títulos modulares com missões de duração contida.",
          "3. Se quer imersão máxima nas férias: mundos abertos com sistemas profundos de progressão e lore documental.",
        ],
      },
    ],
  },
  {
    id: "art-2",
    slug: "como-organizar-backlog-howlongtobeat",
    title: "Como Vencer a Ansiedade do Backlog Gamer com o HowLongToBeat",
    subtitle: "Estratégias práticas de catalogação, gestão de tempo e priorização para aproveitar sua coleção de jogos ao máximo.",
    excerpt: "A sensação de ter centenas de jogos na biblioteca e não saber o que jogar é comum. Descubra como usar as métricas de tempo de zeramento para montar um plano realista de diversão.",
    category: "guias",
    categoryLabel: "Produtividade Gamer",
    readTimeMinutes: 6,
    publishedAt: "2026-09-08T14:00:00.000Z",
    updatedAt: "2026-09-12T12:00:00.000Z",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co2lbd.jpg",
    coverAlt: "Organização de biblioteca de jogos e controle de tempo",
    featured: true,
    author: {
      name: "Leandro Gazoli",
      role: "Editor-Chefe & Fundador do MyGameList",
      avatar: "/logo-mgl.png",
      bio: "Entusiasta de RPGs ocidentais e orientais, colecionador de jogos e arquiteto de software gamer.",
    },
    tags: ["Backlog", "HowLongToBeat", "Produtividade", "Organização", "Steam", "PS5"],
    relatedGames: [
      { id: 1877, name: "The Last of Us Part I", slug: "the-last-of-us-part-i", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5x6l.jpg", metacritic: 88, hltbMain: 15 },
      { id: 114283, name: "Alan Wake 2", slug: "alan-wake-2", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6q80.jpg", metacritic: 89, hltbMain: 18 },
    ],
    sections: [
      {
        heading: "A Paralisia por Excesso de Opções",
        content: [
          "Com promoções sazonais frequentes na Steam, PlayStation Store, Xbox e assinaturas como Game Pass e PS Plus, as bibliotecas dos jogadores cresceram em ritmo vertiginoso. O resultado psicológico é a chamada paralisia por excesso de escolha: abrimos o catálogo, passamos 30 minutos olhando capas e fechamos o aplicativo sem jogar nada.",
          "O primeiro passo para reconquistar o prazer de jogar é aceitar que você não precisa zerar todos os jogos que possui. Trate sua biblioteca como um acervo vivo, e não como uma lista de obrigações profissionais.",
        ],
      },
      {
        heading: "A Regra do Sanduíche de Duração (Longo vs. Curto)",
        content: [
          "Uma das estratégias mais eficientes comprovadas pela comunidade do MyGameList é alternar a duração das campanhas. Após concluir um RPG massivo de 60 a 80 horas (como The Witcher ou Persona 5), nunca emende imediatamente em outro jogo gigante.",
          "Em vez disso, intercale com 1 ou 2 jogos curtos de 3 a 8 horas (como Limbo, Inside, Journey, Firewatch ou Celeste). Isso renova o frescor mental, proporciona a sensação gratificante de conclusão de metas e evita o esgotamento (burnout gamer).",
        ],
        callout: {
          type: "tip",
          text: "Método do Sanduíche: 1 Jogo Longo (50h+) ➔ 1 Jogo Curto (4h a 8h) ➔ 1 Experiência Média (15h a 20h). Essa rotação mantém a motivação sempre elevada.",
        },
      },
      {
        heading: "Interpretando as Três Colunas do HowLongToBeat",
        content: [
          "No MyGameList, cada ficha de jogo apresenta três métricas vitais integradas diretamente da base mundial do HowLongToBeat:",
          "1. História Principal (Main Story): O tempo focado puramente na narrativa, com desvios mínimos. Ideal para quem tem rotinas apertadas.",
          "2. Principal + Extras (Main + Extra): Tempo para concluir a história e as missões secundárias mais ricas. É o formato de jogo mais comum para a maioria dos entusiastas.",
          "3. Conclusão 100% (Completionist): O investimento necessário para desbloquear todos os troféus/conquistas, itens colecionáveis e segredos.",
        ],
      },
      {
        heading: "Defina o Status 'Dropped' Sem Culpa",
        content: [
          "Se um jogo não te cativou nas primeiras 4 a 6 horas de gameplay, não se force a continuar apenas pelo valor pago. Use o status 'Abandonado (Dropped)' na sua biblioteca do MyGameList.",
          "Seu tempo é o recurso mais precioso. Abandonar um jogo que se tornou maçante libera espaço na sua agenda para descobrir aquele título especial que vai marcar a sua memória afetiva.",
        ],
      },
    ],
  },
  {
    id: "art-3",
    slug: "jogos-metacritic-acima-de-90",
    title: "Metacritic Acima de 90: Os Clássicos Definitivos que Resistem ao Tempo",
    subtitle: "O que torna uma obra tão unânime na crítica internacional e por que estes títulos continuam relevantes anos após o lançamento.",
    excerpt: "Alcançar uma pontuação superior a 90 no Metacritic é um feito reservado a menos de 1% de todos os jogos produzidos. Analisamos os pilares de design que elevam essas obras ao status de lendas.",
    category: "analises",
    categoryLabel: "Análise Crítica",
    readTimeMinutes: 8,
    publishedAt: "2026-09-05T09:30:00.000Z",
    updatedAt: "2026-09-12T15:00:00.000Z",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co1r77.jpg",
    coverAlt: "Red Dead Redemption 2 - Arte e pôster oficial",
    featured: false,
    author: {
      name: "Leandro Gazoli",
      role: "Editor-Chefe & Fundador do MyGameList",
      avatar: "/logo-mgl.png",
      bio: "Entusiasta de RPGs ocidentais e orientais, colecionador de jogos e arquiteto de software gamer.",
    },
    tags: ["Metacritic", "Red Dead Redemption 2", "God of War", "GTA V", "Game Design", "Clássicos"],
    relatedGames: [
      { id: 2155, name: "Red Dead Redemption 2", slug: "red-dead-redemption-2", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r77.jpg", metacritic: 97, hltbMain: 50 },
      { id: 19560, name: "God of War", slug: "god-of-war", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/cobkt6.jpg", metacritic: 94, hltbMain: 21 },
      { id: 1020, name: "Grand Theft Auto V", slug: "grand-theft-auto-v", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg", metacritic: 97, hltbMain: 32 },
    ],
    sections: [
      {
        heading: "A Raridade do Círculo dos 90+",
        content: [
          "No agregador Metacritic, o sistema de pontuação ponderada atribui pesos a dezenas de publicações conceituadas da imprensa internacional (como IGN, GameSpot, Eurogamer, Edge e The Verge). Atingir a faixa verde esmeralda com 90 pontos ou mais exige uma conjunção rara de excelência técnica, direção artística coesa e inovação em jogabilidade.",
          "Obras desse calibre frequentemente redefinem o gênero em que atuam, tornando-se referências de estudo para os próprios desenvolvedores nas décadas seguintes.",
        ],
      },
      {
        heading: "Red Dead Redemption 2: A Fronteira da Simulação e Humanidade",
        content: [
          "Com Metacritic 97, a obra-prima da Rockstar Games não é apenas um jogo de ação no Velho Oeste, mas um ecossistema vivo de simulação social. A saga de Arthur Morgan emociona justamente pela atenção maníaca aos detalhes orgânicos: desde a reação da fauna selvagem até a evolução psicológica de uma gangue em declínio.",
          "O ritmo deliberado e cadenciado da movimentação transmite o peso real do mundo, contrariando a pressa instantânea do consumo moderno e convidando o jogador a contemplar a transição dolorosa do século XIX para a modernidade.",
        ],
        callout: {
          type: "quote",
          text: "Red Dead Redemption 2 não teme ser lento quando a história exige introspecção. É uma narrativa de redenção onde o silêncio comunica tanto quanto os tiros.",
        },
      },
      {
        heading: "God of War (2018): Reinvenção Sem Perda de Identidade",
        content: [
          "Reiniciar uma franquia consagrada por sua violência frenética e transformá-la em uma crônica comovente sobre paternidade e trauma foi uma aposta audaciosa do Santa Monica Studio. Ao adotar o plano-sequência contínuo (sem cortes de câmera do início ao fim da campanha) e combate com o Machado Leviatã, Cory Barlog e sua equipe alcançaram 94 no Metacritic.",
          "A relação tensa entre Kratos e Atreus ancora as batalhas grandiosas da mitologia nórdica em uma verdade emocional acessível a qualquer ser humano.",
        ],
      },
      {
        heading: "A Crítica Tem Sempre Razão?",
        content: [
          "Embora o Metacritic seja uma bússola de valor inestimável para orientar investimentos de tempo e dinheiro, notas nunca devem ser dogmas absolutos. Há jogos com notas na faixa de 75 a 85 que possuem comunidades apaixonadas e propostas experimentais únicas.",
          "No MyGameList, combinamos as notas oficiais da crítica com a avaliação própria dos membros da comunidade brasileira, permitindo uma visão equilibrada e sem elitismos.",
        ],
      },
    ],
  },
  {
    id: "art-4",
    slug: "jogos-curtos-para-zerar-fim-de-semana",
    title: "10 Jogos Curtos e Inesquecíveis para Zerar em Menos de 10 Horas",
    subtitle: "Experiências compactas, ricas e memoráveis perfeitas para quem trabalha, estuda ou quer uma história com começo, meio e fim.",
    excerpt: "Nem todo grande jogo precisa de 80 horas. Selecionamos obras compactas que entregam mais emoção e criatividade em uma tarde do que muitos títulos de mundo aberto em semanas.",
    category: "listas",
    categoryLabel: "Seleção Temática",
    readTimeMinutes: 5,
    publishedAt: "2026-09-02T16:00:00.000Z",
    updatedAt: "2026-09-12T11:00:00.000Z",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co1vce.jpg",
    coverAlt: "Jogos independentes curtos e poéticos",
    featured: false,
    author: {
      name: "Leandro Gazoli",
      role: "Editor-Chefe & Fundador do MyGameList",
      avatar: "/logo-mgl.png",
      bio: "Entusiasta de RPGs ocidentais e orientais, colecionador de jogos e arquiteto de software gamer.",
    },
    tags: ["Jogos Curtos", "Indie", "HowLongToBeat", "Celeste", "Inside", "Gris"],
    relatedGames: [
      { id: 1877, name: "The Last of Us Part I", slug: "the-last-of-us-part-i", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5x6l.jpg", metacritic: 88, hltbMain: 15 },
    ],
    sections: [
      {
        heading: "O Poder da Síntese no Game Design",
        content: [
          "Na era dos 'jogos como serviço' (GaaS) com passes de batalha intermináveis e mapas inflados de tarefas repetitivas, obras compactas são uma lufada de ar fresco. Um jogo que dura 4 a 6 horas tem a capacidade de manter o ritmo dramático acelerado, sem 'gorduras' ou enrolação para justificar o preço.",
        ],
      },
      {
        heading: "Destaques Imperdíveis para Zerar no Sábado e Domingo",
        content: [
          "1. Inside (Playdead • ~3.5h): Uma aula de narrativa visual sem uma única linha de diálogo falada. Terror psicológico, quebra-cabeças impecáveis e um dos finais mais comentados da indústria.",
          "2. Gris (Nomada Studio • ~3.5h): Uma pintura em movimento sobre a superação das fases do luto, com trilha sonora orquestral comovente.",
          "3. Firewatch (Campo Santo • ~4h): Um mistério adulto nas florestas de Wyoming que aborda solidão, fuga da realidade e conexões humanas através de um rádio portátil.",
          "4. Celeste (Maddy Makes Games • ~8h): Plataforma de altíssima precisão que serve como metáfora emocionante para o enfrentamento da ansiedade e autoaceitação.",
          "5. Journey (thatgamecompany • ~2h): Uma das experiências mais puras de conexão sensorial e multiplayer anônimo da história dos videogames.",
        ],
        callout: {
          type: "tip",
          text: "Utilize a categoria 'Jogos Curtos' no MyGameList para filtrar instantaneamente centenas de títulos catalogados com menos de 10 horas de campanha segundo o HowLongToBeat.",
        },
      },
      {
        heading: "A Satisfação da Meta Concluída",
        content: [
          "Zerar um jogo curto gera dopamina imediata e reduz a sensação de culpa por acumular títulos não jogados. Comece o fim de semana com uma história inédita e vá dormir no domingo com a certeza de ter presenciado uma obra com começo, meio e fim.",
        ],
      },
    ],
  },
  {
    id: "art-5",
    slug: "evolucao-grand-theft-auto-gta-vi",
    title: "A Evolução de Grand Theft Auto: De Liberty City ao Fenômeno GTA VI",
    subtitle: "Como a franquia da Rockstar Games moldou a cultura pop mundial e o que esperar do salto geracional em Vice City.",
    excerpt: "Com mais de 25 anos de história, Grand Theft Auto redefiniu a liberdade nos jogos eletrônicos. Revisitamos os saltos tecnológicos de cada geração e a expectativa em torno de GTA VI.",
    category: "especiais",
    categoryLabel: "Retrospectiva & Especial",
    readTimeMinutes: 7,
    publishedAt: "2026-08-28T18:00:00.000Z",
    updatedAt: "2026-09-12T13:00:00.000Z",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co2lbd.jpg",
    coverAlt: "Grand Theft Auto V e a franquia GTA",
    featured: false,
    author: {
      name: "Leandro Gazoli",
      role: "Editor-Chefe & Fundador do MyGameList",
      avatar: "/logo-mgl.png",
      bio: "Entusiasta de RPGs ocidentais e orientais, colecionador de jogos e arquiteto de software gamer.",
    },
    tags: ["GTA", "GTA VI", "Rockstar Games", "Mundo Aberto", "Vice City", "Especial"],
    relatedGames: [
      { id: 1020, name: "Grand Theft Auto V", slug: "grand-theft-auto-v", coverImage: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg", metacritic: 97, hltbMain: 32 },
    ],
    sections: [
      {
        heading: "GTA III e o Nascimento do Mundo Aberto 3D",
        content: [
          "Em 2001, a indústria dos videogames mudou irrevogavelmente com a chegada de Grand Theft Auto III ao PlayStation 2. Ao transpor a visão aérea dos dois primeiros jogos para uma perspectiva em terceira pessoa em uma metrópole tridimensional viva, a DMA Design (que logo se tornaria Rockstar North) inventou a gramática moderna do mundo aberto.",
          "Pela primeira vez, a cidade não era apenas um cenário estático de fundo, mas um playground simulado onde viaturas policiais, táxis, pedestres e estações de rádio satíricas coexistiam de forma emergente.",
        ],
      },
      {
        heading: "Vice City e San Andreas: A Cultura Pop em Primeiro Plano",
        content: [
          "Se GTA III introduziu a mecânica, Vice City (2002) injetou estilo. A atmosfera neon da década de 1980, fortemente inspirada em Miami Vice e Scarface, acompanhada por uma das melhores trilhas sonoras licenciadas de todos os tempos, provou que games poderiam dialogar de igual para igual com o cinema de Hollywood.",
          "Dois anos depois, San Andreas (2004) expandiu a escala a proporções inacreditáveis para a época: três cidades completas (Los Santos, San Fierro e Las Venturas), deserto, montanhas e sistemas de RPG de condicionamento físico.",
        ],
      },
      {
        heading: "GTA V: O Maior Sucesso Comercial do Entretenimento",
        content: [
          "Lançado em 2013 e atravessando três gerações consecutivas de consoles, GTA V ultrapassou a marca de 190 milhões de cópias vendidas. A dinâmica inovadora de alternar entre três protagonistas (Michael, Trevor e Franklin) em tempo real garantiu um frescor narrativo duradouro.",
          "O modo GTA Online consolidou a Rockstar como uma força imparável, mantendo servidores lotados por mais de uma década com atualizações constantes de assaltos e negócios virtuais.",
        ],
      },
      {
        heading: "A Fronteira de GTA VI: O Que Esperar de Leonida",
        content: [
          "O retorno a Vice City no estado fictício de Leonida promete o maior salto em inteligência artificial e física já concebido. A dinâmica de casal criminoso entre Lucia e Jason, somada à paródia afiada das redes sociais modernas, coloca GTA VI como o produto de entretenimento mais aguardado de toda a história humana.",
        ],
      },
    ],
  },
  {
    id: "art-6",
    slug: "jogos-brasileiros-em-destaque",
    title: "A Força dos Jogos Brasileiros: Da Criatividade Independente aos Prêmios Mundiais",
    subtitle: "Como estúdios nacionais conquistaram respeito internacional, prêmios no The Game Awards e faturamento global.",
    excerpt: "A indústria brasileira de games deixou de ser uma promessa para se tornar uma realidade global de prestígio. Conheça as produções nacionais que estão fazendo história.",
    category: "industria",
    categoryLabel: "Cenário Nacional",
    readTimeMinutes: 6,
    publishedAt: "2026-08-20T11:00:00.000Z",
    updatedAt: "2026-09-12T10:00:00.000Z",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co1r77.jpg",
    coverAlt: "Indústria brasileira de desenvolvimento de jogos",
    featured: false,
    author: {
      name: "Leandro Gazoli",
      role: "Editor-Chefe & Fundador do MyGameList",
      avatar: "/logo-mgl.png",
      bio: "Entusiasta de RPGs ocidentais e orientais, colecionador de jogos e arquiteto de software gamer.",
    },
    tags: ["Games BR", "Indústria Nacional", "Horizon Chase", "Dandara", "Celeste", "Brasil"],
    sections: [
      {
        heading: "Do Anonimato à Reconhecimento Global",
        content: [
          "Durante muitos anos, o mercado brasileiro de videogames foi visto predominantemente como consumidor de produções estrangeiras. No entanto, na última década, uma geração de desenvolvedores, artistas e compositores nacionais provou que o Brasil possui talento de classe mundial para produzir sucessos aclamados internacionalmente.",
          "Estúdios sediados em Porto Alegre, São Paulo, Belo Horizonte, Curitiba e Brasília exportam hoje experiências para mais de 100 países nas principais plataformas do mercado.",
        ],
      },
      {
        heading: "Casos de Sucesso Consagrados",
        content: [
          "1. Horizon Chase Turbo (Aquiris / Epic Games Brasil): Uma carta de amor aos clássicos de corrida arcade dos anos 90 como Top Gear e OutRun, com trilha sonora pelo lendário Barry Leitch. O sucesso foi tão expressivo que resultou na aquisição do estúdio gaúcho pela gigante Epic Games.",
          "2. Dandara (Long Hat House): Um metroidvania poético e desafiador baseado na heroína quilombola Dandara dos Palmares, aclamado por seu sistema revolucionário de locomoção gravitacional e arte em pixel primorosa.",
          "3. Unsighted (Studio Pixel Punk): RPG de ação isométrico elogiado por veículos mundiais por suas mecânicas temporais tensas, combate responsivo e narrativa LGBTQIA+ sensível.",
          "4. Fobia - St. Dinfna Hotel (Pulsatrix Studios): Survival horror em primeira pessoa ambientado em Santa Catarina que demonstrou a capacidade técnica nacional em gráficos foto-realistas na Unreal Engine.",
        ],
      },
      {
        heading: "O Futuro e o Apoio da Comunidade",
        content: [
          "A melhor maneira de fortalecer os estúdios nacionais é consumir, avaliar e divulgar essas obras. No MyGameList, temos o compromisso contínuo de dar visibilidade a títulos com desenvolvimento nacional e localização completa em PT-BR.",
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES_DATA.find((a) => a.slug === slug);
}

export function getAllArticles(): Article[] {
  return ARTICLES_DATA;
}

export function getFeaturedArticles(): Article[] {
  return ARTICLES_DATA.filter((a) => a.featured);
}
