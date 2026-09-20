# 🎮 Changelog — MyGameList / Game Vault

Todas as atualizações notáveis, melhorias de experiência, correções e novas funcionalidades da plataforma são documentadas neste arquivo de forma transparente para a comunidade de jogadores.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o versionamento semântico.

## [v4.7.1] — 2026-09-20
 
### 🛠️ Melhorias & Design System (Navbar Padronizada)
- **Padronização de Alturas com shadcn/ui:** Todos os elementos interativos da barra de navegação (Links Início/Catálogo, Campo de Busca Instantânea, Botão Seja PRO, Sininho de Notificações, Menu de Usuário/Login e Menu Drawer) agora possuem altura consistente de 36px (`h-9`) no desktop e 44px (`h-11`) no mobile para toques ergonômicos e acessíveis.
- **Componentização Shadcn First:** Adoção dos componentes oficiais `Button` de `@/components/ui/button` nos links e botões da barra.
- **Correção Visual no Campo de Busca:** Removida a duplicidade do atalho de teclado `⌘K` que aparecia em duplicidade fora do campo, mantendo o badge limpo e integrado.

---

## [v4.7.0] — 2026-09-19

### 🚀 Novidades: Nova Página de Planos & Assinaturas
- **Modo Gratuito (Free) em Destaque:** Apresentação clara do plano básico gratuito (R$ 0 para sempre) lado a lado com os planos pagos, destacando acesso ilimitado ao catálogo de 150.000+ jogos, marcação de status, notas e sincronização na nuvem.
- **Seletor de Faturamento Flexível:** Opção de Assinatura Anual (com desconto de 33%, equivalente a R$ 6,65/mês), Assinatura Mensal (R$ 9,90/mês) e Mês Avulso (sem renovação automática).
- **Matriz Comparativa "O Que Tem e O Que Não Tem":** Tabela completa e responsiva detalhando recursos, multiplicadores de XP (1.0x vs 1.5x vs 2.0x), selos de perfil (Neon vs Fundador Ouro), limites de insígnias customizadas e exportações em Excel/CSV/JSON.
- **Destaques de Benefícios & FAQ Interativo:** Cards visuais de diferenciais e acordeão retrátil de perguntas frequentes sanando dúvidas sobre formas de pagamento com Stripe, cancelamento a 1 clique e ativação instantânea.

### 📢 Cards Promocionais Nativos Entre Jogos (Estilo Google AdSense)
- **Componente `GameCardPlanPromo`:** Cards promocionais estilizados no padrão de anúncios patrocinados in-feed, mantendo a proporção `aspect-[3/4]` e raio dos cards de jogos.
- **Inserção Estratégica In-Feed:** Integrado aos carrosséis de catálogo da Home (`CatalogRow`), grade de busca (`SearchClient`), categorias e coleções.
- **4 Criativos Dinâmicos:** Rotação de temas com foco em "100% Sem Anúncios", "Boost de +50% no Ganho de XP", "Selo PRO Neon & Temas de Perfil" e "Membro VIP Fundador".
- **Respeito aos Assinantes:** Cards promocionais são 100% invisíveis para usuários PRO e VIP (`isPremium`).
- **Navegação Acessível:** Link destacado com badge "PRO" adicionado ao menu lateral móvel (`NavDrawer`) e na barra superior (`Navbar`).

---

## [v4.6.1] — 2026-09-19
 
### 🛡️ Otimização & Proteção de Cotas Firestore
- **Blindagem Definitiva do Sitemap:** Removido o caminho de fallback que executava a varredura completa (`firestoreRestQuery`) da coleção `game_translations` com limite de 45.000 itens quando o índice agregado falhava ou estava inacessível.
- **Previsibilidade e Economia Extrema em Builds:** O sitemap agora consulta estritamente os documentos particionados de `system/sitemap_index` (~9 leituras para dezenas de milhares de jogos). Em caso de índice ausente ou inacessível, retorna lista vazia segura sem disparar leituras não controladas.
- **Proteção Contra Picos de Cota:** Eliminação da causa raiz que gerava picos de dezenas de milhares de leituras acidentais durante deploys e builds de produção.
---

## [v4.6.0] — 2026-09-19

### 🚀 Novidades & Experiência Mobile-First
- **Slider/Carrossel Horizontal 16:9 para Destaques Indie:** Substituição do antigo banner estático com rotação por timer por um carrossel horizontal fluido estilo streaming com cards compactos em proporção 16:9 (`aspect-video`).
- **Navegação Fluida Entre Múltiplos Destaques:** Suporte a toque nativo com *scroll snap* em dispositivos móveis e setas flutuantes ergonômicas no desktop com feedback tátil (*haptics*).
- **Card "Ver Todos os Indies" ao Final da Lista:** Integração de card de ação padronizado ao final do slider permitindo acessar instantaneamente a página completa `/indies`.
- **Cabeçalho com Acesso Rápido:** Título "Destaques Indie" com ícone de brilho, link "Ver todos" e botão discreto para fechar/ocultar a seção durante a sessão atual.

---

## [v4.5.0] — 2026-09-19

### ⚡ Performance & Borda Cloudflare
- **Request Coalescing (Single-Flight) no Edge:** Prevenção de picos de consultas concorrentes à origem (*thundering herd*) agrupando requisições idênticas na borda.
- **Cache Global L2/L3 de Configurações e Planos:** As consultas de configurações do sistema (`settings`, `plans_config`) agora contam com cache em borda com invalidação automática sob mutações administrativas.
- **Paginação e Cache com Tags em `/api/user/[username]/games.json`:** Distribuição na borda com cabeçalhos `stale-while-revalidate`, suporte a `page`/`limit` e invalidação em tempo zero baseada na versão `libraryUpdatedAt`.

### 🛡️ Otimização & Redução Drástica de Leituras Firestore
- **Gamification Sync Otimizado:** Eliminação da releitura integral da coleção `users/{uid}/games` a cada sincronização de XP/nível, reutilizando estatísticas agregadas (`libraryStats`) e cacheando definições estáticas de conquistas e missões.
- **Persistência de Sumário da Biblioteca:** Armazenamento automático de `libraryStats` no documento de perfil, reduzindo consultas em cascata e leituras redundantes.

---

## [v4.4.1] — 2026-09-19

### 🐛 Correções & Transição de Páginas
- **Transição e Navegação de Jogos Corrigida:** Solucionado o problema onde o endereço mudava na barra do navegador ao clicar num jogo mas a tela visualmente permanecia na Home.
- **Padronização de URLs com `getGameUrl`:** Eliminação de discrepâncias de slugs nos componentes `HomeHeroCarousel` e `artigos/[slug]` que causavam redirecionamentos assíncronos no Next.js Router.
- **Prevenção de Loops e Redirects Desnecessários:** Normalização e decodificação de slugs em `/game/[id]/[slug]`, evitando descompasso entre links client-side e canonicals de SEO.
- **Fronteira de Hidratação do React:** Inclusão explícita de diretivas `"use client"` em todos os subcomponentes modulares da tela de jogo (`GameSynopsis`, `GameAgeGate`, `GameMediaGallery`, etc.) evitando anomalias de transição na troca de rota.
- **Tratamento de Falhas com `error.tsx`:** Adicionada boundary dedicada para a rota de jogos com recuperação amigável e botão de recarregar.

---

## [v4.4.0] — 2026-09-19

### ⚡ Otimização Extrema & Performance Edge
- **Cache Global Multicamadas (Cloudflare Cache API + KV):** Listas do IGDB, dados HowLongToBeat e traduções de jogos passam a ser armazenadas e compartilhadas globalmente entre todos os 300+ datacenters da Cloudflare, blindando os limites de taxa da API e acelerando os tempos de resposta para menos de 50ms.
- **Catálogo Consolidado da Home (`/api/games/home-catalog`):** A página inicial agora consome todas as 6 seções principais (Populares, Lançamentos, Em Breve, Dublados PT-BR, Curtos e Saga GTA) em uma única requisição HTTP cacheada na borda, eliminando conexões concorrentes e acelerando a abertura em smartphones.
- **Supressão de Refetch SSR:** Eliminação da busca duplicada no carregamento de detalhes de jogos já renderizados no servidor, economizando requisições redundantes de rede.

### 🛡️ Otimização & Economia de Quota Firestore
- **Sincronização Condicional da Biblioteca (Smart Sync):** A lista de jogos do usuário é mantida no cache local (`localStorage`) e validada contra o timestamp `libraryUpdatedAt` do perfil. Leituras repetidas de centenas de documentos na inicialização caem para 0 caso a biblioteca não tenha sido modificada em outro dispositivo.
- **Persistência Offline com IndexedDB Multi-Abas:** Habilitado o `persistentLocalCache` com `persistentMultipleTabManager` no SDK cliente do Firestore, garantindo navegação instantânea e navegação offline sem refazer leituras já efetuadas.
- **Interceptação na Borda de Consultas Públicas:** As seções de Jogos Indie e Ranking da Comunidade foram desacopladas de consultas diretas no navegador e migradas para rotas de borda cacheadas (`/api/indies` e `/api/rankings/community`), impedindo estouro de cota e eliminando custos invisíveis no cliente.

---

## [v4.3.0] — 2026-09-19

### 🚀 Novidades
- **Nova Splash Screen Gamer Animada:** Inicialização cinematográfica com animação fluida em GSAP, logotipo tridimensional iluminado em Esmeralda e Ciano, e transição suave para a interface.
- **Action de Atualização PWA:** Usuários de aplicativo instalado recebem notificações visuais amigáveis sempre que uma nova versão da plataforma for publicada, podendo atualizar com 1 toque.
- **Transparência de Versão:** Exibição da versão ativa e link para o histórico de novidades.

### ⚡ Performance & App Shell
- **Fim da Tela Branca na Inicialização:** Implementada estratégia *Stale-While-Revalidate* e entrega instantânea de cache para o App Shell do PWA (`/?source=pwa` e `/`), eliminando completamente o atraso de tela branca.
- **Cores Críticas no Frame 0:** Canvas do navegador e WebView inicializam em fundo escuro (`#0e0f12`) desde o primeiro milissegundo, prevenindo qualquer lampejo de tela clara (FOUC).
- **Desbloqueio de Renderização de Fontes:** Remoção do `@import` bloqueante no CSS, substituído por pré-conexão assíncrona de alta performance.
- **Resiliência do Pipeline e Catálogo:** Otimizada a inicialização dos serviços de catálogo e compilação do servidor, prevenindo falhas de integração no deploy e garantindo renderização assíncrona contínua.

---

## [v4.2.0] — 2026-09-17

### 🚀 Novidades
- **Vitrine & Votação de Jogos Indie:** Espaço dedicado para desenvolvedores independentes cadastrarem e divulgarem seus títulos diretamente no catálogo da comunidade.
- **Destaque de Jogos do Catálogo IGDB:** Integração para promover jogos já catalogados na vitrine indie sem duplicação de dados.

### 🛠️ Melhorias
- **Rolagem e Navegação Tátil:** Preservação e restauração da posição de rolagem ao retornar do detalhe do jogo para o calendário e catálogo.
- **Refinamento Mobile-First:** Barra de navegação inferior compacta com feedback tátil e melhor ergonomia para uso com uma só mão.

---

## [v4.1.0] — 2026-09-10

### 🚀 Novidades
- **Personalização de Perfil Gamer:** Suporte a temas personalizados, insígnias de conquistas e escolha de fundo customizado.
- **Estatísticas Avançadas de Backlog:** Visualização consolidada de tempo de jogo via HowLongToBeat e notas da crítica via Metacritic.

### 🐛 Correções
- Tratamento resiliente de falhas de carregamento de capas externas com fallback visual temático.
