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

## 🛠️ Tecnologias Utilizadas

- **Next.js 15 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS** + **Lucide React**
- **Firebase 11** (Auth & Cloud Firestore)
- **HowLongToBeat API**
- **Canvas-Confetti** (Animação de conquista gamer)
