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

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS** + **Lucide React**
- **Firebase 11** (Auth & Cloud Firestore)
- **HowLongToBeat API**
- **Canvas-Confetti** (Animação de conquista gamer)
