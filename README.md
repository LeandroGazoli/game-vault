# 🎮 GameVault — Plataforma de Perfil e Rastreamento de Jogos

Uma plataforma web moderna, rápida e responsiva para gamers organizarem sua biblioteca de jogos, acompanharem suas notas e visualizarem tempos médios de zeramento com base no **Metacritic** e **HowLongToBeat**.

---

## ✨ Funcionalidades Principais

- 🔍 **Busca & Catálogo Global:** Pesquise qualquer jogo com capas em alta definição, data de lançamento, gêneros e plataformas.
- 🎯 **Notas do Metacritic:** Exibição oficial da pontuação do Metacritic (com cores verde 75+, amarelo 50-74 e vermelho <50).
- ⏱️ **Tempos HowLongToBeat (HLTB):** Estimativa dos 3 tempos de zeramento:
  - 🗡️ **História Principal** (*Main Story*)
  - 🗺️ **História + Missões Secundárias** (*Main + Extras*)
  - 👑 **100% Complecionista** (*Completionist*)
- 🏆 **Organização por Status:**
  - 🏆 **Zerado** (Com efeito de celebração em confetes!)
  - 🎮 **Jogando** (Em andamento)
  - 🛑 **Dropado** (Interrompido)
  - ⏳ **Quero Jogar** (Backlog / Lista de desejos)
- ⭐ **Avaliações & Diário Gamer:** Atribua sua nota pessoal (0 a 10), registre horas reais jogadas, plataforma utilizada e escreva suas resenhas e impressões.
- 📊 **Dashboard de Estatísticas:**
  - Contador de jogos concluídos e taxa de conclusão (%)
  - Total de horas registradas
  - Média de notas atribuídas
  - Gêneros mais jogados
- 🔐 **Autenticação & Banco de Dados com Firebase:**
  - Suporte a **Firebase Auth** (E-mail/Senha e Google) e **Cloud Firestore**.
  - **Modo Demonstração / Local:** Funciona de imediato em modo offline/demo sem requerer setup inicial de chaves, sincronizando no LocalStorage.

---

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar em ambiente de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## ⚙️ Variáveis de Ambiente (Opcional)

Crie um arquivo `.env.local` na raiz do projeto com as suas credenciais:

```env
# RAWG Video Games Database API Key (https://rawg.io/apidocs)
NEXT_PUBLIC_RAWG_API_KEY=sua_chave_rawg_aqui

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=sua_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

---

## 🔎 SEO — IndexNow (Bing, Yandex, Seznam, Naver)

A chave IndexNow do site é `48fc588eda9f43cbb2e5d4e272fe41d2` e fica publicada em
`public/48fc588eda9f43cbb2e5d4e272fe41d2.txt` — é esse arquivo que prova a posse do
domínio. **Ele precisa estar no ar (deploy feito) antes de qualquer envio**, senão o
IndexNow responde `403`.

> O Google **não** participa do IndexNow: ele continua sendo atendido pelo
> `sitemap.xml` + Search Console. O IndexNow acelera Bing/Copilot, Yandex e afins.

### Três formas de notificar

1. **Painel admin** → `/admin/settings` → card *Indexação Instantânea (IndexNow)*.
   Envia todas as URLs do `sitemap.ts` e registra o disparo na auditoria.

2. **Linha de comando** (útil em CI ou após publicar algo específico):
   ```bash
   npm run seo:indexnow                                   # sitemap.xml inteiro
   npm run seo:indexnow -- /game/1942/the-witcher-3-wild-hunt /rankings
   ```

3. **API** `POST /api/indexnow` — aceita admin autenticado (`Bearer <idToken>`) ou
   automação via header `x-indexnow-secret`:
   ```bash
   curl -X POST https://www.mygameslist.com.br/api/indexnow \
     -H "x-indexnow-secret: $INDEXNOW_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"all": true}'
   ```
   Corpo alternativo: `{"urls": ["/game/119277/elden-ring"]}`.

Variáveis relacionadas: `INDEXNOW_KEY` (opcional — a chave do repositório é o padrão) e
`INDEXNOW_SECRET` (necessária apenas para disparos automatizados). Se trocar a chave,
renomeie também o arquivo em `public/` para bater com o novo valor.

### Páginas de jogos (URLs dinâmicas)

`/game/[id]/[slug]` renderiza sob demanda, então não existe lista estática dessas URLs.
A coleção **`game_translations`** funciona como registro: `src/lib/gameApi.ts` a grava
sempre que uma página de jogo renderiza e gera tradução, guardando `gameId`, `gameName` e
`updatedAt`. `src/lib/gameRegistry.ts` lê isso com o Admin SDK e monta o slug canônico via
`getGameUrl` — sem chamar o IGDB.

Ter tradução funciona como filtro de qualidade: significa que a página tem sinopse em
PT-BR própria, e não apenas o texto em inglês espelhado da API.

Esse registro alimenta duas coisas:

- **O sitemap** passa a listar o catálogo real (não só os ~60 títulos de rankings) e agora
  usa ISR — `revalidate = 86400`, uma regeneração por dia, sem depender de deploy. O teto
  vem de `SITEMAP_GAME_LIMIT`, cujo padrão (45.000) acompanha o limite de 50.000 URLs de
  um sitemap único. **Cada documento custa uma leitura no Firestore por regeneração** — em
  2026-09-08 o registro tinha 11.802 jogos, ou ~11,8 mil leituras/dia. Se isso pesar na
  cota, baixe a variável; se o registro passar de 50.000, o sitemap precisa virar índice
  paginado.

- **O envio incremental** (`mode: "delta"`), que é a forma correta de rotina:
  ```bash
  npm run seo:indexnow -- --delta            # só o que mudou desde a última vez
  npm run seo:indexnow -- --delta --dry-run  # mostra sem enviar
  ```
  O cursor do último envio fica em `system/indexnow` no Firestore e **só avança se o
  IndexNow aceitar o lote** — falha significa reenviar na próxima. Isso evita repetir as
  mesmas URLs, que é o que rende `429`. Se a resposta traz `hasMore: true`, o lote encheu
  (2.000 por padrão) e vale rodar de novo.

  O lote é pequeno de propósito: em domínio novo no IndexNow é melhor subir aos poucos que
  despejar o catálogo de uma vez. Com 11.802 páginas registradas, a primeira carga leva ~6
  execuções — ou passe `{"mode":"delta","limit":10000}` para acelerar (10.000 é o máximo
  por requisição que o IndexNow aceita).

  `updatedAt` é gravado quando a tradução é criada, não a cada render, então uma página já
  enviada não volta para a fila. A exceção é ganhar tradução de enredo depois da sinopse:
  aí o `updatedAt` sobe e a página é reenviada — o que é semanticamente correto, já que o
  conteúdo mudou de fato.

No painel, **Enviar novidades** faz o delta e **Tudo** reenvia o sitemap inteiro.

Sem `FIREBASE_SERVICE_ACCOUNT_KEY` o registro simplesmente devolve lista vazia: o sitemap
continua saindo com as rotas fixas e o delta responde zero, sem quebrar nada.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS** + **Lucide React**
- **Firebase 11** (Auth & Cloud Firestore)
- **HowLongToBeat API**
- **Canvas-Confetti** (Animação de conquista gamer)
