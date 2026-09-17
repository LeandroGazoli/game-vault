#!/usr/bin/env bash
#
# Publica a branch ATUAL no ambiente de homologação.
#
#   ./scripts/deploy-homolog.sh
#
# O ambiente é isolado de produção: KV próprio (manutenção e cache incremental separados) e
# indexação bloqueada (robots + meta noindex).
#
# ⚠️ O FIRESTORE é o mesmo de produção — escrita aqui altera dados reais.

set -euo pipefail

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$BRANCH" = "main" ]; then
  echo "✗ Você está na main. Homologação existe para revisar branches ANTES do merge."
  echo "  Troque de branch ou use 'npx wrangler deploy' para publicar em produção."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "⚠ Há alterações não commitadas. Elas VÃO para homologação, mas não estão no git —"
  echo "  então o que você revisar pode não ser o que existe na branch."
  printf "  Continuar? [s/N] "
  read -r reply
  [ "$reply" = "s" ] || [ "$reply" = "S" ] || { echo "abortado"; exit 1; }
fi

echo "→ Branch: $BRANCH"
echo "→ Build (SITEMAP_GAME_LIMIT=50 para não gastar leitura do Firestore à toa)"
rm -rf .next .open-next
SITEMAP_GAME_LIMIT=50 IS_HOMOLOG=true NODE_OPTIONS="--max-old-space-size=8192" \
  npx opennextjs-cloudflare build

echo "→ Deploy em homologação"
npx wrangler deploy --env homolog

echo
echo "✓ Publicado. A URL aparece na saída do wrangler acima."
echo "  Lembre: robots bloqueado, KV isolado, Firestore COMPARTILHADO com produção."
