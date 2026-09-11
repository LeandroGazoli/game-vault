# 🎨 DESIGN.md — Design System & Diretrizes de UI/UX do Game Vault

Este documento formaliza a **identidade visual, fundamentos de design, padrões de componentes, tokens e filosofia de experiência do usuário (UX)** do **Game Vault**. Ele serve como fonte de verdade para designers, desenvolvedores e agentes de IA garantirem consistência em todas as telas da plataforma (Web e PWA Mobile).

---

## 🧭 1. Filosofia de Design: *Mobile-First & App Nativo*

O Game Vault é desenhado com a sensibilidade de um **aplicativo nativo moderno de entretenimento** (como Apple Arcade, Steam Deck UI, Xbox Game Pass app e Letterboxd), priorizando:

1. **Alta densidade de informação sem poluição:** Telas compactas, onde capas, títulos, notas e status convivem em perfeita harmonia visual.
2. **Revelação Progressiva (*Progressive Disclosure*):** Recursos complexos (como ficha técnica avançada, notas pessoais do Vault e filtros densos) devem ser acessíveis sob demanda por meio de abas segmentadas, acordeões retráteis e modais dedicados, em vez de sobrecarregar a primeira rolagem.
3. **Respeito à *Thumb Zone* (Ergonomia Móvel):** Botões críticos de ação (`Adicionar ao Vault`, `Desejar`, `Voltar`, `Buscar`) devem ficar em zonas acessíveis com uma mão só em smartphones, com área de toque mínima de **44px × 44px**.
4. **Superfícies Táteis & Micro-Interações:** Feedback visual imediato (`active:scale-[0.98]`), efeitos de desfoque translúcido (*frosted glass*) e suporte a haptics no Capacitor (`triggerSelectionHaptic()`).

---

## 🎨 2. Paleta de Cores e Tokens Visuais

### 2.1. Superfícies & Profundidade (Dark Theme)

O Game Vault utiliza uma estética escura com camadas de elevação e contraste suave, evitando pretos 100% absolutos que causam cansaço visual.

| Token | Código HEX / Tailwind | Uso Principal |
|---|---|---|
| **Background Principal** | `#0b0d12` (`bg-[#0b0d12]`) | Fundo geral da aplicação e safe-areas |
| **Superfície Nível 1 (Cards)** | `#141822` (`bg-[#141822]`) | Cards de jogos, blocos de conteúdo e seções |
| **Superfície Nível 2 (Elevada)** | `#1c2230` (`bg-[#1c2230]`) | Menus suspensos, modais e tooltips |
| **Superfície Translúcida (Glass)** | `bg-black/60 backdrop-blur-xl` | Barras flutuantes, headers e chips |
| **Bordas Sutis** | `border-white/10` ou `border-white/[0.08]` | Linhas divisórias e contornos de cards |

### 2.2. Cores Semânticas de Acento

| Papel | Tom | Tailwind | Uso |
|---|---|---|---|
| **Acento Primário (Brand)** | **Verde Esmeralda** (`#10B981`) | `emerald-500` / `emerald-400` | Botões de ação principal, status salvos, notas positivas |
| **Acento Secundário (Tech)** | **Ciano Gamer** (`#00E5FF`) | `cyan-400` / `cyan-300` | Tempos de campanha HLTB, links de busca, destaques |
| **Lista de Desejos / Amor** | **Pink Vibrante** (`#EC4899`) | `pink-500` / `pink-400` | Botão `♡ Desejar / Desejado`, corações |
| **Avaliação & Estrelas** | **Âmbar Dourado** (`#F59E0B`) | `amber-400` | Estrelas de classificação, selos de franquia |
| **Classificação / Alerta** | **Vermelho Carmim** (`#EF4444`) | `red-500` / `red-400` | Badges de +18, jogos dropados, perigo |

---

## 📐 3. Tipografia e Escala Hierárquica

- **Fonte Principal:** `Inter` / `system-ui` para leitura limpa e moderna em interfaces com muita densidade de dados.
- **Números e Métricas:** Fonte monoespaçada (`font-mono`) para notas, durações de horas (`53h`) e pontuações do Metacritic, garantindo alinhamento perfeito de dígitos.

| Estilo | Classes Tailwind | Aplicação |
|---|---|---|
| **Display Hero** | `text-3xl lg:text-4xl font-black tracking-tight` | Título do jogo no Hero principal |
| **Título de Seção** | `text-base sm:text-lg font-bold text-white` | Cabeçalhos de carrosséis e blocos |
| **Título de Card** | `text-sm font-semibold text-white line-clamp-1` | Título do GameCard em grades |
| **Subtítulo / Meta** | `text-xs text-gray-400 font-medium` | Desenvolvedoras, ano, gêneros |
| **Badge / Pill** | `text-[10px] sm:text-[11px] font-bold uppercase` | Micro-badges, classificações, status |

---

## 🧩 4. Padrões de Componentes

### 4.1. Bordas e Cantos Arredondados
- **Containers e Modais:** `rounded-3xl` (24px) ou `rounded-[32px]` para uma sensação amigável e táctil de aplicativo nativo.
- **Cards e Posters:** `rounded-2xl` (16px) com proporção padronizada de capa `aspect-[3/4]`.
- **Botões e Inputs:** `rounded-xl` (12px) a `rounded-2xl` (16px).
- **Badges e Chips:** `rounded-full` ou `rounded-lg` (8px).

### 4.2. Barra de Métricas (Stats Bar em 3 Colunas)
Presente tanto no mobile quanto no desktop:
- **Coluna 1 (Avaliação):** Estrela amarela + nota com base `/10` ou `/5`.
- **Coluna 2 (Metacritic):** Ícone de troféu/medalha + score Metacritic em verde esmeralda.
- **Coluna 3 (Campanha):** Ícone de relógio + horas estimadas pelo HowLongToBeat (`53h`).

### 4.3. Botões de Ação Duplos (Thumb Zone)
- **Botão Secundário (`Desejar`):** Ocupa 30-35% da largura. Alterna entre neutro e pink iluminado quando ativado.
- **Botão Primário (`Adicionar ao Meu Vault`):** Ocupa 65-70% da largura. Verde esmeralda com texto preto de alto contraste e sombra difusa `shadow-emerald-500/25`. Se o jogo já estiver no Vault, transforma-se em `[ 🎮 Editar no Meu Vault ]` com o selo de status atual.

### 4.4. Ficha Técnica Key-Value (Specs Table)
Layout em duas colunas estilo tabela de especificações automotivas/hardware:
- Chave à esquerda em tom neutro (`text-gray-400 font-medium`).
- Valor à direita em branco/acento com ênfase visual (`text-white font-bold`).

---

## 📱 5. Boas Práticas Mobile & PWA

1. **Áreas Seguras (*Safe-Areas*):**
   - Padding inferior dinâmico respeitando a barra do sistema operacional:  
     `pb-[max(env(safe-area-inset-bottom,0px)+5rem,6rem)]`.
2. **Prevenção de Toques Fantasmas:**
   - Todo elemento clicável deve ter `cursor-pointer` e transição `active:scale-95` ou `active:scale-[0.98]`.
3. **Imagens Resilientes:**
   - Toda imagem externa (IGDB / RAWG / Steam) deve conter fallback gracioso com degradê geométrico e ícone se falhar o carregamento via `onError`.

---

## 🚫 6. Anti-Patterns (O que NÃO fazer)

- ❌ **Não misturar arco-íris de badges coloridas** no cabeçalho do jogo. Agrupe categorias na ficha técnica ou em hubs de descoberta.
- ❌ **Não usar cantos pontiagudos (`rounded-none` ou `rounded-sm`)** em containers principais.
- ❌ **Não usar texto longo sem controle de quebra:** sempre aplique `line-clamp-1` ou `line-clamp-2` em cards de catálogo.
- ❌ **Não bloquear a rolagem do usuário com modais desnecessários:** prefira gavetas deslizantes (*bottom sheets*) ou acordeões retráteis.
