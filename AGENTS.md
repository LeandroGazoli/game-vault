# 🤖 AGENTS.md — Diretrizes de Engenharia, Arquitetura e Organização do Game Vault

Este documento estabelece as **regras inegociáveis de arquitetura, padrões de código, limites de complexidade e organização de pastas** para todos os agentes de Inteligência Artificial e desenvolvedores atuando no repositório **Game Vault**.

---

## 🎯 1. Visão Geral e Filosofia do Projeto

- **Produto:** Plataforma e PWA (Capacitor) para colecionadores e entusiastas de videogames gerenciarem seu catálogo, tempo de jogo (HLTB), notas (Metacritic/comunidade) e backlog.
- **Design System:** Estilo *App Nativo / Mobile-First*:
  - Cantos arredondados generosos: `rounded-2xl` e `rounded-3xl`.
  - Superfícies escuras com profundidade: fundo `#0b0d12`, cards `#141822`, bordas sutis `border-white/10`.
  - Cor de destaque vibrante (Acento Primário): **Verde Esmeralda** (`#10B981` / `emerald-500` / `emerald-400`).
  - Interface compacta, sem poluição visual, utilizando **Progressive Disclosure** (acordeões retráteis e abas segmentadas).

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

---

## ♻️ 4. Reutilização de Código e Princípio DRY

1. **Evitar Duplicação de Formatação e Regras:**
   - Datas, durações de tempo e horas jogadas devem usar formatadores centralizados em `src/lib/utils/formatters.ts`.
   - Cores e rótulos de status (`playing`, `completed`, `backlog`, `dropped`) devem usar unicamente `src/components/StatusBadge.tsx` ou constantes centralizadas.
   - O disparador de vibração tátil para smartphones deve invocar exclusivamente os helpers de `src/lib/capacitor.ts` (`triggerSelectionHaptic`, `triggerSuccessHaptic`).
2. **Componentes Presentacionais Puros:**
   - Sempre que um componente apenas renderiza dados baseados em props (ex: `GameStatsBar`, `GameSpecsTable`), mantenha-o desacoplado de contextos globais e requisições de rede. Isso facilita testes unitários e visualização isolada.

---

## 🛡️ 5. Padrões de TypeScript e Resiliência

- **Zero `any`:** Não utilize `any`. Tipifique explicitamente as props de cada componente via `interface` ou `type`.
- **Tratamento de Imagens e Falhas de Rede:** Qualquer imagem vinda de APIs externas (IGDB, RAWG, Steam) deve possuir tratamento de `onError` com fallback para gradiente ou placeholder SVG elegante.
- **Progressive Enhancement:** O app deve funcionar tanto no navegador desktop quanto no mobile, suportando toques táteis, gestos de swipe e adaptação às áreas seguras (*safe-areas*) do iOS/Android.

---

## 🚦 6. Protocolo de Modificação para Agentes de IA

Sempre que um agente for criar ou alterar código no Game Vault, deve seguir rigorosamente estes passos:

1. **Não Inflar Arquivos Existentes:** Se uma funcionalidade nova exigir mais de 40-50 linhas de código dentro de um componente que já está próximo de 250 linhas, **crie um novo arquivo componente** e apenas importe-o.
2. **Validação Obrigatória em Dois Níveis:**
   - **Nível 1 (Tipagem):** Executar `./node_modules/.bin/tsc --noEmit`.
   - **Nível 2 (Build de Produção):** Executar `./node_modules/.bin/next build`.
   - NUNCA declare uma tarefa como concluída se o build falhar ou quebrar rotas estáticas/dinâmicas.
3. **Commits Semânticos:** Escreva mensagens de commit seguindo a convenção [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(...)`: Novas funcionalidades ou novos componentes.
   - `fix(...)`: Correções de bugs.
   - `refactor(...)`: Reestruturação de arquivos ou quebra de monólitos em componentes menores sem alterar o comportamento externo.
   - `style(...)`: Ajustes puramente visuais e Tailwind.
4. **Homologação e Deploy:**
   - Mantenha o trabalho em branch de homologação (`homologacao/*`).
   - Gere e compartilhe o link de preview no Vercel para validação do usuário.
