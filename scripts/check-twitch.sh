#!/usr/bin/env bash
#
# Testa um par CLIENT_ID + CLIENT_SECRET contra o Twitch ANTES de subir para lugar nenhum.
#
#   npm run check:twitch
#
# POR QUE EXISTE: subir a chave e descobrir que não funciona só depois do deploy custa uma
# rodada inteira. Pior, a mensagem do Twitch ("invalid client secret") não diz se o problema
# é o segredo ou o ID — e o caso mais comum é par de APPS DIFERENTES: você gera um segredo
# novo no app A, mas o ID guardado é do app B. Rotacionar o segredo nunca conserta isso.
#
# Os valores são lidos com prompt oculto: não vão para o histórico do shell nem para a tela.

set -euo pipefail

echo "Cole os valores do MESMO app em https://dev.twitch.tv/console/apps"
echo

printf "Client ID: "
read -rs ID
echo
printf "Client Secret: "
read -rs SECRET
echo
echo

[ -z "$ID" ] || [ -z "$SECRET" ] && { echo "✗ Os dois são obrigatórios."; exit 1; }

echo "  id: ${#ID} caracteres | secret: ${#SECRET} caracteres  (o Twitch usa 30 nos dois)"

RESP="$(curl -s -m 25 -X POST \
  "https://id.twitch.tv/oauth2/token?client_id=${ID}&client_secret=${SECRET}&grant_type=client_credentials")"

case "$RESP" in
  *access_token*)
    echo "  ✓ PAR VÁLIDO — o Twitch devolveu um token."
    echo
    echo "  Suba os DOIS, do mesmo app:"
    echo "    npx wrangler secret put TWITCH_CLIENT_ID"
    echo "    npx wrangler secret put TWITCH_CLIENT_SECRET"
    ;;
  *"invalid client secret"*)
    echo "  ✗ O Twitch RECONHECE o ID mas RECUSA o segredo."
    echo
    echo "  Quase sempre significa que os dois são de apps diferentes, ou que o segredo"
    echo "  foi regenerado depois de você copiá-lo. Abra o app, clique em New Secret e"
    echo "  copie o Client ID DA MESMA TELA."
    ;;
  *"invalid client"*)
    echo "  ✗ O Twitch não reconhece este Client ID."
    echo "  Confira se copiou o ID certo (e não o segredo no lugar dele)."
    ;;
  *)
    echo "  ✗ Resposta inesperada: $(printf '%s' "$RESP" | head -c 160)"
    ;;
esac
