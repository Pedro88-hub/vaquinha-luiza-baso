#!/bin/bash
set -euo pipefail

GH="${GH_BIN:-gh}"
REPO_NAME="${1:-vaquinha-luiza-baso}"

if ! command -v "$GH" >/dev/null 2>&1; then
  echo "GitHub CLI (gh) não encontrado. Instale em: https://cli.github.com"
  exit 1
fi

if ! "$GH" auth status >/dev/null 2>&1; then
  echo "Faça login no GitHub:"
  "$GH" auth login --hostname github.com --git-protocol https --web --scopes repo
fi

OWNER=$("$GH" api user -q .login)

if "$GH" repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  echo "Repositório já existe. Enviando alterações..."
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO_NAME.git"
  git push -u origin main
else
  echo "Criando repositório público $OWNER/$REPO_NAME..."
  "$GH" repo create "$REPO_NAME" --public --source=. --remote=origin --push \
    --description "Vaquinha de apoio moral da Luiza Baso — brincadeira entre amigos, sem pagamentos reais."
fi

echo "Ativando GitHub Pages..."
"$GH" api -X POST "/repos/$OWNER/$REPO_NAME/pages" \
  -f build_type=legacy \
  -f "source[branch]=main" \
  -f "source[path]=/" 2>/dev/null || true

echo ""
echo "✅ Site publicado em:"
echo "   https://$OWNER.github.io/$REPO_NAME/"
