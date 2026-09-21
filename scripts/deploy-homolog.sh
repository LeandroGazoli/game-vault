#!/usr/bin/env bash
#
# Publica a branch ATUAL em https://homolog.mygameslist.com.br
#
#   npm run deploy:homolog
#
# O ambiente é isolado de produção: KV próprio (manutenção e cache incremental separados) e
# indexação bloqueada (robots + meta noindex).
#
# ⚠️ O FIRESTORE é o mesmo de produção — escrita aqui altera dados reais.
#
# ⚠️ NO PRIMEIRO DEPLOY: adicione `homolog.mygameslist.com.br` em Firebase → Authentication
#    → Settings → Authorized domains, senão o login com Google falha lá.

set -euo pipefail

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$BRANCH" = "main" ]; then
  echo "✗ Você está na main. Homologação existe para revisar branches ANTES do merge."
  echo "  Troque de branch ou use 'npm run deploy' para publicar em produção."
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
# NEXT_PUBLIC_* precisa estar aqui, no BUILD, não no wrangler.jsonc: o Next substitui
# `process.env.NEXT_PUBLIC_X` pelo valor literal durante a compilação. Declarar como var do
# Worker não tem efeito nenhum sobre o bundle — e sem isto o sitemap, o canonical e as URLs
# de OpenGraph de homologação apontariam para o site de produção.
echo "→ Build (SITEMAP_GAME_LIMIT=50 para não gastar leitura do Firestore à toa)"
rm -rf .next .open-next
SITEMAP_GAME_LIMIT=50 \
IS_HOMOLOG=true \
NEXT_PUBLIC_SITE_URL="https://homolog.mygameslist.com.br" \
NODE_OPTIONS="--max-old-space-size=8192" \
  npx opennextjs-cloudflare build

echo "→ Patch do Worker para negociação de conteúdo Markdown"
node scripts/patch-worker.mjs

echo "→ Deploy em homologação"
npx wrangler deploy --env homolog

HOMOLOG_URL="https://homolog.mygameslist.com.br"

echo
echo "✓ Publicado em $HOMOLOG_URL"
echo "  Lembre: robots bloqueado, KV isolado, Firestore COMPARTILHADO com produção."

# No primeiro deploy o DNS e o certificado acabaram de nascer e levam alguns minutos.
# Um 404/525 aqui não quer dizer que o deploy falhou.
echo
echo "→ Conferindo a URL"
STATUS="$(curl -s -o /dev/null -m 20 -w "%{http_code}" "$HOMOLOG_URL/" || echo "000")"
if [ "$STATUS" = "200" ]; then
  echo "  ✓ respondendo 200"
else
  echo "  ⚠ respondeu $STATUS — se este foi o primeiro deploy, o certificado ainda está"
  echo "    sendo emitido. Espere alguns minutos e recarregue."
fi
