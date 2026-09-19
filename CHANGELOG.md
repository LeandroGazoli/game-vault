# 🎮 Changelog — MyGameList / Game Vault

Todas as atualizações notáveis, melhorias de experiência, correções e novas funcionalidades da plataforma são documentadas neste arquivo de forma transparente para a comunidade de jogadores.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o versionamento semântico.

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
