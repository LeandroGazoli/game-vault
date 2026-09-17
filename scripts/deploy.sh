#!/usr/bin/env bash
#
# Publica em PRODUÇÃO e limpa o cache da geração anterior no mesmo passo.
#
#   npm run deploy            # build + deploy + faxina
#   npm run deploy -- --no-purge
#
# POR QUE A FAXINA VEM JUNTO: cada deploy grava as páginas sob um build ID novo e nunca
# apaga o anterior. Sem isso o KV acumulou 23 gerações / ~190 MB de 1 GB — e no teto a
# escrita falha, travando tanto o deploy quanto o toggle de manutenção do painel.
#
# A ordem importa. O build ID só é registrado DEPOIS de o deploy dar certo, e a purga só
# apaga o que não é esse ID. Se o deploy falhar, nada é registrado e nada é apagado.

set -euo pipefail

PURGE=1
for arg in "$@"; do
  [ "$arg" = "--no-purge" ] && PURGE=0
done

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
  echo "⚠ Você está em '$BRANCH', não na main — isto publica em PRODUÇÃO."
  printf "  Continuar? [s/N] "
  read -r reply
  [ "$reply" = "s" ] || [ "$reply" = "S" ] || { echo "abortado"; exit 1; }
fi

echo "→ Build"
rm -rf .next .open-next
NODE_OPTIONS="--max-old-space-size=8192" npx opennextjs-cloudflare build

BUILD_ID="$(cat .next/BUILD_ID)"
echo "→ Build ID: $BUILD_ID"

echo "→ Deploy em produção"
npx wrangler deploy

# Só aqui o build passa a ser "o que está no ar". A purga confia nesta chave, não no
# diretório local — assim ela funciona de qualquer máquina e nunca apaga a versão viva.
echo "→ Registrando o build no KV"
npx wrangler kv key put "deploy/current-build-id" "$BUILD_ID" \
  --binding NEXT_INC_CACHE_KV --remote

if [ "$PURGE" = "1" ]; then
  echo
  echo "→ Limpando gerações antigas do cache"
  # Falha aqui não invalida o deploy: o site já está no ar. Por isso não propaga o erro.
  node scripts/purge-kv-cache.mjs --from-kv --apply || \
    echo "⚠ Faxina não concluída (cota diária?). O deploy está OK — rode depois: npm run purge:kv"
fi

echo
echo "✓ Produção atualizada ($BUILD_ID)"
