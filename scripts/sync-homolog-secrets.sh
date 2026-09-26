#!/usr/bin/env bash
#
# Copia para o worker de HOMOLOGAÇÃO os secrets que ele precisa para funcionar.
#
#   npm run secrets:homolog
#
# Segredo no Cloudflare é POR WORKER. `wrangler deploy --env homolog` publica o código, mas
# não leva secret nenhum junto — por isso homologação subiu sem catálogo: sem
# TWITCH_CLIENT_ID/SECRET não há IGDB, e sem catálogo a home fica vazia.
#
# ─────────────────────────────────────────────────────────────────────────────────────────
# O QUE ESTE SCRIPT NÃO COPIA, DE PROPÓSITO
#
#   STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET — homologação usa o MESMO Firestore de
#     produção. Com a chave viva, um teste de checkout vira cobrança real no cartão de
#     alguém. Melhor que o checkout quebre em homologação e você teste pagamento em
#     produção com valor baixo, ou com chave de teste do Stripe se um dia criar uma.
#
#   RESEND_API_KEY — mesma lógica: disparo de e-mail em homologação sairia para os
#     endereços REAIS dos usuários.
#
#   VERCEL_OIDC_TOKEN — resquício da Vercel. Não serve mais nem em produção (vale apagar
#     de lá: `npx wrangler secret delete VERCEL_OIDC_TOKEN`).
# ─────────────────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ENV_FILE=".env.local"

# Só o necessário para revisar catálogo e navegação.
SECRETS_NECESSARIOS=(TWITCH_CLIENT_ID TWITCH_CLIENT_SECRET INTERNAL_API_SECRET)

# Opcionais: sem eles a revisão funciona, só algumas telas ficam vazias.
SECRETS_OPCIONAIS=(GEMINI_API_KEY GNEWS_API_KEY NEWSDATA_API_KEY STEAM_API_KEY XBL_API_KEY)

if [ ! -f "$ENV_FILE" ]; then
  echo "✗ $ENV_FILE não encontrado. Ele é a fonte dos valores."
  exit 1
fi

# Lê um valor do .env sem imprimi-lo. Tira aspas das pontas, se houver.
ler_valor() {
  grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

enviar() {
  local nome="$1"
  local valor
  valor="$(ler_valor "$nome")"
  if [ -z "$valor" ]; then
    return 1
  fi
  printf '%s' "$valor" | npx wrangler secret put "$nome" --env homolog >/dev/null 2>&1
  echo "  ✓ $nome"
  return 0
}

# As credenciais do Twitch/IGDB sao testaveis antes de subir — e precisam ser. O .env.local
# tinha um par REVOGADO, que foi para o worker sem reclamar e deixou a home sem catalogo
# (a API responde 200 com lista vazia, entao nada denuncia o problema).
validar_twitch() {
  local id secret resposta
  id="$(ler_valor TWITCH_CLIENT_ID)"
  secret="$(ler_valor TWITCH_CLIENT_SECRET)"
  [ -z "$id" ] || [ -z "$secret" ] && return 1
  resposta="$(curl -s -m 25 -X POST \
    "https://id.twitch.tv/oauth2/token?client_id=$id&client_secret=$secret&grant_type=client_credentials")"
  case "$resposta" in
    *access_token*) return 0 ;;
    *) echo "  ✗ O Twitch RECUSOU as credenciais de $ENV_FILE:"
       echo "    $(printf '%s' "$resposta" | head -c 120)"
       echo "    Pegue um par válido em https://dev.twitch.tv/console/apps e atualize o arquivo."
       echo "    Subir assim deixaria a home sem catálogo, sem nenhum erro aparente."
       return 1 ;;
  esac
}

echo "→ Validando credenciais do Twitch/IGDB"
if validar_twitch; then
  echo "  ✓ o Twitch aceitou o par"
  TWITCH_OK=1
else
  TWITCH_OK=0
fi

echo
echo "→ Secrets necessários"
faltando=()
for nome in "${SECRETS_NECESSARIOS[@]}"; do
  case "$nome" in
    TWITCH_*)
      if [ "$TWITCH_OK" != "1" ]; then
        echo "  ⊘ $nome — não enviado (par inválido)"
        faltando+=("$nome")
        continue
      fi
      ;;
  esac
  enviar "$nome" || { echo "  ✗ $nome — ausente em $ENV_FILE"; faltando+=("$nome"); }
done

echo
echo "→ Secrets opcionais"
for nome in "${SECRETS_OPCIONAIS[@]}"; do
  enviar "$nome" || echo "  — $nome (não está em $ENV_FILE; a tela correspondente fica vazia)"
done

echo
echo "→ FIREBASE_SERVICE_ACCOUNT_KEY"
if npx wrangler secret list --env homolog 2>/dev/null | grep -q FIREBASE_SERVICE_ACCOUNT_KEY; then
  echo "  ✓ já configurado"
else
  cat <<'AVISO'
  ✗ FALTANDO — e sem ele homologação não lê nada do Firestore no servidor.

  Não está no .env.local e NÃO deve ser colado em chat. Rode você mesmo:

      npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY --env homolog

  O wrangler abre um prompt: cole o JSON inteiro da service account em uma linha e
  pressione Enter. O valor não fica no histórico do shell.
AVISO
fi

echo
if [ ${#faltando[@]} -gt 0 ]; then
  echo "⚠ Faltaram secrets necessários: ${faltando[*]}"
  exit 1
fi
echo "✓ Pronto. Os secrets valem na PRÓXIMA requisição — não precisa deployar de novo."
