# 🤖 AGENTS.md — Diretrizes de Engenharia, Arquitetura e Organização do Game Vault

Este documento estabelece as **regras inegociáveis de arquitetura, padrões de código, limites de complexidade e organização de pastas** para todos os agentes de Inteligência Artificial e desenvolvedores atuando no repositório **Game Vault**.

---

## 🎯 1. Visão Geral e Filosofia do Projeto

- **Produto:** Plataforma e PWA (Capacitor) para colecionadores e entusiastas de videogames gerenciarem seu catálogo, tempo de jogo (HLTB), notas (Metacritic/comunidade) e backlog.
- **Filosofia Central: Mobile-First, Compacto e App Native (Nosso maior cliente é mobile):**
  - O projeto é **Mobile-First acima de tudo**. Cada tela, componente, fluxo e interação deve ser concebido e desenhado primeiramente para o celular, comportando-se e parecendo um **aplicativo nativo de smartphone**.
  - **Apenas depois do mobile estar 100% refinado, fluido e polido é que o desktop deve ser trabalhado.** A prioridade máxima de desenvolvimento e experiência de uso é sempre o cliente mobile.
  - **Interface Compacta e Densidade Inteligente:** Evite espaços em branco excessivos ou layouts espalhados. A interface deve ser compacta, direta e limpa, utilizando **Progressive Disclosure** (acordeões retráteis, abas segmentadas e drawers) para manter tudo acessível sem rolagem cansativa.
- **Design System:** Estilo *App Nativo / Mobile-First*:
  - Cantos arredondados generosos: `rounded-2xl` e `rounded-3xl`.
  - Superfícies escuras com profundidade: fundo `#0b0d12`, cards `#141822`, bordas sutis `border-white/10`.
  - Cor de destaque vibrante (Acento Primário): **Verde Esmeralda** (`#10B981` / `emerald-500` / `emerald-400`).
  - Safe-areas, toques com feedback tátil e ergonomia de uso com uma mão (área de alcance do polegar).

---

## 📏 2. Limites Estritos de Arquivo (Budgets de Complexidade)

> [!CAUTION]
> **Arquivos gigantescos (> 500 linhas) são terminantemente proibidos em novas implementações.** 
> Arquivos legados que ultrapassam essa marca devem ser refatorados progressivamente a cada nova intervenção.

| Tipo de Arquivo | Limite Recomendado | Limite Máximo Absoluto | Ação Obrigatória se Ultrapassado |
|---|---|---|---|
| **Componentes de UI / Telas** | 150 - 250 linhas | **300 linhas** | Quebrar em subcomponentes na pasta da feature |
| **Páginas e Orquestradores (`page.tsx`, `*Client.tsx`)** | 100 - 200 linhas | **250 linhas** | Extrair seções visuais para componentes dedicados |
| **Custom Hooks (`use*.ts`)** | 80 - 150 linhas | **200 linhas** | Separar em hooks especializados por responsabilidade |
| **Utilitários e Serviços (`lib/`)** | 100 - 200 linhas | **250 linhas** | Dividir em submódulos dentro de `lib/<domínio>/` |
| **Definições de Tipos (`types/`)** | 100 - 200 linhas | **300 linhas** | Dividir `types.ts` por contexto (`game.types.ts`, `user.types.ts`) |

---

## 🏗️ 3. Padrão de Componentização e Arquitetura Modular

### 3.1. Páginas como Orquestradores Leves
Páginas no App Router (`src/app/**`) e seus clientes de hidratação (`*Client.tsx`) devem agir **apenas como coordenadores**:
- Carregamento de dados / rotas.
- Composição dos componentes visuais de alto nível.
- **Anti-Pattern Proibido:** Nunca declare funções internas do tipo `const renderSectionA = () => (...)`, `const renderSectionB = () => (...)` dentro do corpo de um arquivo de página totalizando milhares de linhas. Cada seção deve ser um arquivo `.tsx` independente.

### 3.2. Estrutura de Diretórios Recomendada

```text
src/
├── app/                          # Rotas Next.js (Apenas composição e Server Components)
│   ├── game/[id]/
│   │   ├── page.tsx              # Server Component / Metadata SEO
│   │   └── GameDetailClient.tsx  # Orquestrador leve (< 200 linhas)
├── components/
│   ├── ui/                       # Design System / Componentes Atômicos Primitivos
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── SegmentedTabs.tsx
│   │   └── Accordion.tsx
│   ├── common/                   # Componentes de domínio reutilizáveis em múltiplas telas
│   │   ├── GameCard.tsx
│   │   ├── CatalogRow.tsx
│   │   ├── MetacriticBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   └── HltbCard.tsx
│   ├── game/                     # Componentes modulares exclusivos da tela de jogo
│   │   ├── GameHeroMobile.tsx    # Hero com capa, badges, banner e ações flutuantes
│   │   ├── GameHeroDesktop.tsx   # Hero em layout expandido para telas grandes
│   │   ├── GameStatsBar.tsx      # Barra de 3 colunas (Avaliação, Metacritic, HLTB)
│   │   ├── GameActionButtons.tsx # Botões duplos (Desejar / Adicionar ao Vault)
│   │   ├── GameVaultCard.tsx     # Card retrátil sanfonado do Vault com status e notas
│   │   ├── GameSpecsTable.tsx    # Ficha técnica key-value em 2 colunas
│   │   ├── GameSynopsis.tsx      # Sinopse expansível com tradução on-demand
│   │   ├── GameMediaGallery.tsx  # Carrossel/grid de prints, vídeos e lightbox
│   │   └── GameDlcsSection.tsx   # Lista de expansões e conteúdos adicionais
│   ├── profile/                  # Componentes modulares da tela de perfil e edição
│   │   ├── ProfileHeroCard.tsx
│   │   ├── GamerBadgesCard.tsx
│   │   └── ShareGamerCardModal.tsx
│   └── navigation/               # Navegação global
│       ├── Navbar.tsx
│       ├── MobileBottomNav.tsx
│       └── FloatingActions.tsx
├── hooks/                        # Custom Hooks com regras de negócio e estado
│   ├── useGameDetails.ts
│   ├── useVaultActions.ts
│   ├── useShareGame.ts
│   └── useHaptics.ts
├── lib/                          # Lógica pura desacoplada
│   ├── api/                      # Clientes de APIs externas (igdb, rawg, hltb, steam)
│   ├── types/                    # Tipagens TypeScript subdivididas
│   └── utils/                    # Utilitários de texto, datas, slugs e validações
└── context/                      # Contextos React globais (Auth, GameLibrary)
```

### 3.3. Regra Shadcn First: Verificação Obrigatória de Componentes
- **Obrigatoriedade Prévia:** Antes de criar qualquer novo componente visual ou de UI do zero, é **terminantemente obrigatório** verificar se já existe um componente correspondente no projeto (em `src/components/ui/`, `src/components/common/`, etc.) ou no catálogo do **shadcn/ui** (Button, Dialog/Modal, Card, Tabs, Badge, Progress, Sheet, DropdownMenu, Avatar, Accordion, Tooltip, etc.).
- **Prioridade de Adoção:**
  1. Utilizar componente já existente no repositório.
  2. Adicionar o componente via shadcn/ui oficial ou importar implementação equivalente padronizada com Tailwind e acessibilidade WAI-ARIA (Radix/Base UI).
  3. Apenas se nenhuma opção acima suprir a necessidade de negócio, criar um componente novo respeitando estritamente o budget de linhas e o design system do projeto.
- **Proibição de Duplicidade:** Nunca crie botões artesanais, modais customizados ou abas com estilos divergentes quando componentes atômicos já estiverem disponíveis.

---

## ♻️ 4. Reutilização de Código e Princípio DRY

1. **Evitar Duplicação de Formatação e Regras:**
   - Datas, durações de tempo e horas jogadas devem usar formatadores centralizados em `src/lib/utils/formatters.ts`.
   - Cores e rótulos de status (`playing`, `completed`, `backlog`, `dropped`) devem usar unicamente `src/components/StatusBadge.tsx` ou constantes centralizadas.
   - O disparador de vibração tátil para smartphones deve invocar exclusivamente os helpers de `src/lib/capacitor.ts` (`triggerSelectionHaptic`, `triggerSuccessHaptic`).
2. **Componentes Presentacionais Puros:**
   - Sempre que um componente apenas renderiza dados baseados em props (ex: `GameStatsBar`, `GameSpecsTable`), mantenha-o desacoplado de contextos globais e requisições de rede. Isso facilita testes unitários e visualização isolada.

## 📝 5. Campos de Edição de Texto (Rich Text, Markdown e HTML)

- **Suporte Multi-Formato:** Todos os campos de edição de texto enriquecido (anotações, reviews, descrições personalizadas) devem implementar suporte a:
  - **Tiptap Rich Text Editor** (WYSIWYG interativo com barra de ferramentas e atalhos).
  - **Markdown** (edição em texto puro com formatação padrão e preview).
  - **HTML** (código bruto / tags HTML sanitizadas).
- **Escolha do Usuário:** A interface deve oferecer um seletor claro (ex: abas segmentadas ou dropdown de modo) permitindo que o usuário escolha qual estilo/modo de edição prefere utilizar, persistindo a preferência sempre que cabível.
- **Sanitização e Segurança:** Qualquer renderização ou persistência de HTML/Markdown deve passar por sanitização rigorosa contra XSS antes da exibição.

---

## 🪟 6. Modais/Popups vs. Páginas Dedicadas

- **Popups e Modais apenas para Conteúdo Curto:** Modais, popups, bottom sheets ou dialogs devem ser restritos a ações atômicas, confirmações, feedbacks rápidos, alertas e pequenos formulários de entrada única (ex: confirmação de exclusão, quick share, seletor de nota rápido).
- **Páginas Dedicadas para Conteúdos Avançados:** Fluxos com múltiplos campos, configurações complexas, edições aprofundadas e personalizações (ex: customização do site/perfil, edição de catálogo, configurações gerais, formulários longos) **devem obrigatoriamente ser construídos em rotas/páginas dedicadas** (`/settings/*`, `/profile/edit`, etc.), garantindo espaço adequado, boa usabilidade em dispositivos móveis e suporte a navegação/histórico de URL do navegador.

---

## 🛡️ 7. Padrões de TypeScript e Resiliência

- **Zero `any`:** Não utilize `any`. Tipifique explicitamente as props de cada componente via `interface` ou `type`.
- **Tratamento de Imagens e Falhas de Rede:** Qualquer imagem vinda de APIs externas (IGDB, RAWG, Steam) deve possuir tratamento de `onError` com fallback para gradiente ou placeholder SVG elegante.
- **Progressive Enhancement:** O app deve funcionar tanto no navegador desktop quanto no mobile, suportando toques táteis, gestos de swipe e adaptação às áreas seguras (*safe-areas*) do iOS/Android.

## 🔒 8. Segurança, Prevenção de Falhas e Otimização de Performance

Todo código novo ou refatorado deve passar por uma checagem rigorosa de segurança, eficiência de execução e gestão de recursos antes de ser homologado:

### 8.1. Auditoria de Segurança e APIs (`backend-security-coder` & `api-security-best-practices`)
- **Validação e Sanitização Estrita:** Nunca confie em inputs de usuários ou respostas de APIs externas. Valide payloads com schemas (ex: Zod) e sanitize dados ricos (HTML/Markdown) contra ataques de XSS e injection.
- **Autorização e IDOR:** Sempre valide permissões e posse de recursos no backend/API routes (verificar se o `userId` autenticado é o real proprietário do item antes de mutações ou leituras restritas).
- **Proteção de Segredos e Rate Limiting:** Jamais exponha chaves de API sensíveis, tokens de serviço ou credenciais de banco no lado cliente. Aplique rate limiting e proteções contra requisições abusivas em endpoints críticos.
- **Tratamento Seguro de Erros:** Não vaze stack traces, queries internas ou dados confidenciais em respostas de erro ou logs públicos de produção.

### 8.2. Prevenção de Loops Infinitos e Memory Leaks
- **Ciclos de Vida e Hooks no React:**
  - Inspecione minuciosamente matrizes de dependência em `useEffect`, `useCallback` e `useMemo` para evitar re-renderizações em cascata e loops infinitos de chamadas de API.
  - **Limpeza Obrigatória (Cleanup):** Sempre remova listeners de eventos (`window.addEventListener`), observers (`ResizeObserver`, `IntersectionObserver`), subscrições em tempo real (Firebase/WebSockets) e intervalos/timers (`setInterval`, `setTimeout`) nas funções de retorno/desmontagem dos hooks.
- **Desacoplamento e Retenção de Memória:** Evite reter referências circulares em closures ou em stores globais de longa duração para objetos descartáveis de tela.

### 8.3. Otimizações Gerais de Execução
- **Lazy Loading e Split de Código:** Utilize carregamento dinâmico (`next/dynamic`) para componentes pesados que não são exibidos no carregamento inicial (ex: editores ricos, modais secundários, gráficos).
- **Debounce e Throttle:** Aplique debounce em inputs de busca com digitação rápida e throttle em listeners contínuos de scroll, redimensionamento ou toques táteis.
- **Cache e Memoização Eficiente:** Utilize estratégias de cache apropriadas (SWR/React Query/Next Cache) e memoize cálculos computacionalmente caros.

---

## 🚦 9. Protocolo de Modificação para Agentes de IA

Sempre que um agente for criar ou alterar código no Game Vault, deve seguir rigorosamente estes passos:

1. **Pensar no Mobile Primeiro (App Native & Compacto):** Toda UI nova ou refatoração deve ser idealizada, estruturada e validada para celulares primeiro (comportamento de app nativo, compacto, sem excesso de espaçamentos ou scrolls desnecessários). O desktop só deve ser desenhado ou adaptado após o mobile estar impecável.
2. **Não Inflar Arquivos Existentes:** Se uma funcionalidade nova exigir mais de 40-50 linhas de código dentro de um componente que já está próximo de 250 linhas, **crie um novo arquivo componente** e apenas importe-o.
3. **Validação Obrigatória em Dois Níveis:**
   - **Nível 1 (Tipagem):** Executar `./node_modules/.bin/tsc --noEmit`.
   - **Nível 2 (Build de Produção):** Executar `./node_modules/.bin/next build`.
   - NUNCA declare uma tarefa como concluída se o build falhar ou quebrar rotas estáticas/dinâmicas.
4. **Commits Semânticos:** Escreva mensagens de commit seguindo a convenção [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(...)`: Novas funcionalidades ou novos componentes.
   - `fix(...)`: Correções de bugs.
   - `refactor(...)`: Reestruturação de arquivos ou quebra de monólitos em componentes menores sem alterar o comportamento externo.
   - `style(...)`: Ajustes puramente visuais e Tailwind.
5. **Homologação e Deploy:**
   - Mantenha o trabalho em branch de homologação (`homologacao/*`).
   - Gere e compartilhe o link de preview no Vercel para validação do usuário.
