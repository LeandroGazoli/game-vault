# 🎮 Changelog — MyGameList / Game Vault

Todas as atualizações notáveis, melhorias de experiência, correções e novas funcionalidades da plataforma são documentadas neste arquivo de forma transparente para a comunidade de jogadores.

O formato baseia-se em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue o versionamento semântico.

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
