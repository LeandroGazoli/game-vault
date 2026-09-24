# 🎮 Changelog — MyGameList / Game Vault

Todas as atualizações notáveis, melhorias de experiência, correções e novas funcionalidades da plataforma são documentadas neste arquivo de forma transparente para a comunidade de jogadores.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o versionamento semântico.

## [v4.13.0] — 2026-09-24

### 🚀 Novidades: Mural da Comunidade (Guestbook) & Mais Aguardados com Countdown
- **Mural da Comunidade (Guestbook no Perfil):**
  - Permite que amigos e visitantes deixem mensagens públicas de amizade e reconhecimento diretamente no perfil.
  - Seletor de *"Jogamos Juntos?"* para associar o recado a um jogo específico em comum (ex: *Helldivers 2*, *Call of Duty*, *Sea of Thieves*).
  - Suporte a moderação opcional pelo proprietário (aprovação prévia das mensagens antes de se tornarem visíveis publicamente).
- **Seção "Mais Aguardados" com Contagem Regressiva em Tempo Real:**
  - Vitrine modular destacando os jogos mais aguardados pelo usuário com contagem regressiva viva de Dias, Horas e Minutos até o lançamento oficial.
  - Personalização de capa, plataforma e motivo do *hype*.
  - Celebração automática com badge visual *"Já Lançado!"* assim que a data de estreia é atingida.
- **Integração Modular do Perfil:**
  - Ambas as seções adicionadas ao catálogo e ao orquestrador modular (`ProfileModularContainer`), permitindo reordenar e ocultar conforme o gosto do usuário.

---

## [v4.12.0] — 2026-09-21
 
### 🚀 Novidades: Identidade Gamer, Sincronização Explicada, Favoritos & Twitch Live
- **Onboarding e Cadastro Enriquecido:**
  - Escolha livre de `@username` único com gerador aleatório temático gamer (ex: `cyber_hunter_42`).
  - Coleta de data de nascimento para conformidade com ECA/COPPA e proteção a menores de idade.
  - Campo opcional de indicação por amigo (`@username`).
  - Edição do `@username` permitida uma única vez nas configurações do perfil, bloqueando alterações subsequentes abusivas.
- **Guia 'Como a Sincronização Funciona':**
  - Modal explicativo passo a passo sobre perfis públicos, sincronização manual sob demanda e processamento em segundo plano.
- **Sistema de Favoritar Usuários (Estrela ⭐):**
  - Botão de favoritar ao lado do botão Seguir com popover de 4 toggles independentes: Notificações de Reviews, 100% Zerados, Guias/Artigos e Lives.
- **Integração Twitch em Tempo Real:**
  - Anel e selo "LIVE" pulsante e respirando ao redor do avatar do jogador no perfil.
  - Player embutido da Twitch retrátil no topo do perfil exibindo o jogo atual e link direto.
- **Rail 'Jogando Agora' (Now Playing Rail):**
  - Carrossel rotativo a cada 6 segundos entre os jogos em andamento do usuário com controles de play/pause, tempo registrado e meta HLTB.
- **Vídeos de Gameplay na Galeria & Proteção Anti-Spoiler:**
  - Suporte a clipes de vídeo de até 90s (.mp4/.webm) e marcação de spoiler com efeito de desfoque (blur) e botão para revelar.
- **Jogar Steam Direto do Navegador:**
  - Ação rápida nativa via protocolo `steam://run/[appId]` nos cards de jogos PC/Steam, exclusiva para o próprio dono do perfil.

---

## [v4.11.0] — 2026-09-21
 
### 🚀 Novidades: Upload Direto de Imagens, Vitrine de Troféus Importados & Gamificação de Franquias
- **Upload Direto de Arquivos de Imagem:**
  - Usuários não dependem mais de URLs externas de imagens ou links de terceiros.
  - Suporte completo a seleção de arquivos do smartphone/computador para fotos de avatar, banners de capa e screenshots da galeria via FileReader.
- **Vitrine de Troféus & Platinas Importadas:**
  - Componente dedicado para exibição das conquistas e platinas mais raras importadas diretamente da Steam, PlayStation Network e Xbox.
  - Indicadores de raridade global, insígnia de platina e modal com descrição completa do feito alcançado.
- **Galeria de Screenshots Gamer:**
  - Espaço dinâmico com suporte a envio direto de fotos de gameplay, contador de curtidas com feedback tátil e legendas personalizadas.
- **Insígnias de Franquias Lendárias (Franchise Badges):**
  - Mapeamento oficial de sagas consagradas (*Dark Souls*, *Resident Evil*, *Persona*, *God of War*, *Zelda*).
  - Cada jogo zerado ou concluído na biblioteca adiciona progresso e estrelas para desbloquear os tiers de Bronze, Prata, Ouro e Platina (100% da saga).
- **Métricas Visuais e Identidade Gamer:**
  - Mapa de calor de atividade gamer dos últimos 90 dias estilo GitHub.
  - Vitrines de Top 5 Personagens Favoritos e Ficha Técnica de Hardware/Setup Gamer.

---

## [v4.10.1] — 2026-09-21

### 🚀 Novidades: Suporte Oficial a Markdown para Agentes de IA (Content Negotiation)
- **Negociação de Conteúdo com `Accept: text/markdown`:** Agentes autônomos, assistentes de IA e LLMs agora podem solicitar qualquer página do site enviando o cabeçalho `Accept: text/markdown`, recebendo uma representação textual limpa, rápida e desprovida de layouts HTML pesados.
- **Estrutura com Frontmatter YAML & JSON-LD Preservado:** As respostas em Markdown incluem Frontmatter padronizado no topo (`title`, `description`, `image`, `url`) e anexam todos os dados estruturados de Schema.org (`JSON-LD`) em blocos de código formatados ao final do documento.
- **Métricas de Tokens e Content Signals:** Emissão automática de cabeçalhos de auditoria de IA (`x-markdown-tokens`, `x-original-tokens`) e diretivas oficiais de uso de conteúdo (`Content-Signal: ai-train=yes, search=yes, ai-input=yes`).
- **Descoberta Nativa nos Metadados:** Integração de tags `<link rel="alternate" type="text/markdown" href="...">` no cabeçalho das páginas para descoberta transparente por crawlers.

---

## [v4.10.0] — 2026-09-21
 
### 🚀 Novidades: Importador de Bibliotecas Xbox Live & Nintendo Switch
- **Sincronização Oficial Xbox Live:**
  - Importação de títulos do Xbox Series X|S, Xbox One, Xbox 360 e PC Game Pass com enriquecimento de capas e metadados no IGDB.
  - Suporte ao modelo híbrido de API Key: cota global do servidor via Cloudflare Workers (`XBL_API_KEY`) ou chave pessoal do usuário.
  - **Segurança Reforçada:** A chave OpenXBL pessoal do usuário é persistida com proteção estrita de acesso na subcoleção privada (`users/{uid}/private/data`), evitando qualquer exposição em endpoints públicos.
  - Sincronização automática da Gamertag (`socials.xbox`) no perfil do jogador.
- **Importação Completa Nintendo Switch (3 Cenários):**
  - Aviso transparente em conformidade com as diretrizes e regras de autenticação da Nintendo.
  - **Cenário 1 (Lista Rápida):** Usuário cola os títulos do Switch, com busca inteligente de capas no IGDB e plataforma pré-selecionada.
  - **Cenário 2 (Exportação CSV/Backup):** Suporte nativo para arquivos CSV exportados do Deku Deals, Backloggd, SwitchBackup e Tinfoil/DBI com parsing resiliente de horas e status.
  - **Cenário 3 (Vínculo de Friend Code):** Formatação automática `SW-XXXX-XXXX-XXXX` e salvamento com 1 clique no perfil (`socials.switch`) com badge de destaque.

### 🛠️ Melhorias & Arquitetura
- **Modularização do Importador:** `GameImporterModal.tsx` decomposto de mais de 1.300 linhas para subcomponentes leves e atômicos (`SteamImportTab`, `XboxImportTab`, `NintendoImportTab`, `PlaystationImportTab`, `QuickTextImportTab`, `FileImportTab`, `ImportReviewStep`), respeitando os budgets de complexidade do `AGENTS.md`.
- **Governança Cloudflare Pages & Workers:** Documentação atualizada do projeto para a esteira e bindings do Cloudflare.

---

## [v4.9.0] — 2026-09-20
 
### 🚀 Novidades: Customização Total de Perfil e Site para Assinantes VIP & PRO
- **Estilização com CSS Scoped Personalizado:** Assinantes VIP e PRO agora contam com um editor de CSS customizado no perfil (`VisualThemeAccordion`). Com proteção por escopo estrito (`#profile`) e sanitização em tempo real contra injeções ou quebra de layout global, os usuários podem aplicar glows, gradientes e bordas personalizadas sem afetar o resto da plataforma.
- **Snippets de Estilização Prontos com 1 Toque:** Inclusão de templates rápidos de CSS no editor (+ Neon Glow, + Gold Royale, + Glass Backdrop) permitindo customização instantânea mesmo para quem não domina CSS.
- **Novos Wallpapers Épicos Exclusivos:** Quatro novos fundos temáticos em alta definição adicionados ao catálogo (`Gold Obsidian VIP`, `Dark Fantasy Castle`, `Nebula Odyssey` e `Retro Synthwave Highway`), com visualização em modal e badges exclusivos.
- **Novos Temas e Cores OLED:** Introdução de 3 novos temas de cores (`Gold Royale`, `Neon Sunset`, `Ametista Mística`) e 3 cores sólidas OLED para fundo (`Gold Dark`, `Amethyst Noir`, `Cyber Slate`).
- **Novos Títulos de Honra Gamer:** Novos títulos desbloqueáveis para exibição no perfil: `👑 Membro VIP Vitalício` e `⚡ Assinante PRO Oficial`.
- **Transparência em `/planos`:** Tabela comparativa e matriz de benefícios totalmente atualizadas detalhando os novos recursos de identidade visual, wallpapers exclusivos, temas premium e suporte a CSS/HTML.

---

## [v4.8.1] — 2026-09-20
 
### 🚀 Novidades: Central de Contato, Leads e Cloudflare Email Routing
- **Central Exclusiva no Painel Administrativo:** Todas as mensagens recebidas via formulário do site e e-mails enviados para `contato@mygameslist.com.br` e `parcerias@mygameslist.com.br` agora vão exclusivamente para o Painel Admin (`/admin/contatos`), sem sobrecarregar sua caixa de entrada pessoal.
- **Cloudflare Email Worker (`mygamelist-email-inbound`):** Implantado Worker que intercepta em tempo real qualquer e-mail enviado diretamente aos domínios institucionais e persiste na coleção `contact_messages` via webhook seguro.
- **Distinção de Origem e Canal:** A interface administrativa agora identifica visualmente a origem de cada lead (se veio pelo formulário do site ou se foi um e-mail direto para `contato@` ou `parcerias@`).
- **Resposta Oficial com 1 Clique via Resend:** Modal de resposta embutido que dispara e-mails oficiais assinados pelo MyGameList de volta ao usuário através do Resend, marcando a mensagem como "respondido" e registrando o histórico de atendimento.

---

## [v4.8.0] — 2026-09-20
 
### 🚀 Novidades: Sistema Completo de Anúncios de Planos Aleatórios & Painel Administrativo
- **Lógica de Exibição com Probabilidade & Posições Aleatórias:** Anúncios de planos agora surgem intercalados aleatoriamente nos feeds (Busca, Categorias, Coleções e Carrosséis da Home) com base em probabilidade configurável (0% a 100%), sem afetar ou prejudicar a integridade dos itens originais.
- **Painel Administrativo Completo com Live Preview (`/admin/plans`):** Seção dedicada no painel de administração permitindo ativar/desativar anúncios, controlar probabilidade de exibição, limitar densidade máxima por listagem, editar textos dos criativos e visualizar em tempo real (`Live Preview`) como o anúncio será renderizado para os usuários.
- **Sincronização Dinâmica de Preços em Tempo Real:** O valor exibido no anúncio (ex: "A partir de R$ 6,66/mês" ou plano VIP) é sincronizado automaticamente com as configurações e planos reais do Stripe/Firestore, prevenindo qualquer desincronização de valores.

### 🛠️ Melhorias & UI/UX
- **Card 100% Clicável:** Toda a área do card promocional agora é interativa e clicável com redirecionamento direto para a página `/planos`, eliminando restrição de clique apenas no botão.
- **Correção de Cortes e Estouro Visual:** Otimização da hierarquia tipográfica, paddings internos (`p-3 sm:p-3.5`) e flexibilização dos limites de texto, garantindo apresentação impecável sem cortes de botões ou sobreposição em smartphones compactos e monitores desktop.
- **Testes Automatizados:** Suíte completa de testes cobrindo probabilidade matemática, inserção segura de slots, preservação da lista e sincronização de moedas/preços.

---

## [v4.7.3] — 2026-09-20
 
### 🐛 Correções & Interface
- **Animação de Curadoria IA na Busca:** Correção no empilhamento e delimitação da camada de animação (`ai-card-border-beam`) nos itens recomendados por IA no dropdown de autocomplete da busca (`LiveSearchInput`). O gradiente cônico agora contorna a borda do card como feixe neon sem cobrir capa, título, gênero ou plataforma do jogo.

---

## [v4.7.2] — 2026-09-20
 
### 🐛 Correções & Painel Administrativo
- **Cálculo Real de MRR via Stripe:** Removida a estimativa sintética baseada em usuários do banco de dados (`proUsers * 9.9`), garantindo que o card de MRR reflita exclusivamente as assinaturas ativas na API do Stripe.
- **Detalhamento Financeiro do Mês Vigente:** Novo painel financeiro exibindo Receita Bruta, Taxas Operacionais da Stripe, Lucro Líquido Real e Margem Líquida (%) calculados via `balanceTransactions`.
- **Extrato Recente do Stripe & Indicador de Ambiente:** Visualização retrátil das últimas transações do Stripe com valores brutos e taxas discriminadas, além de identificador de ambiente (Modo Teste ou Ao Vivo).

---

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
