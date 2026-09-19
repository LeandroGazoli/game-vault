# 🎮 Changelog — MyGameList / Game Vault

Todas as atualizações notáveis, melhorias de experiência, correções e novas funcionalidades da plataforma são documentadas neste arquivo de forma transparente para a comunidade de jogadores.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o versionamento semântico.

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
