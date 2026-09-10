#!/bin/bash
# Export script: Safely copies the Learn Better Web Hub into your local clone of dragosbo/learn-better
# Usage: ./export_to_github.sh /path/to/your/local/learn-better-repo

TARGET_REPO="$1"

if [ -z "$TARGET_REPO" ]; then
  echo "Usage: ./export_to_github.sh /path/to/your/local/learn-better-repo"
  exit 1
fi

if [ ! -d "$TARGET_REPO/.git" ]; then
  echo "Error: $TARGET_REPO does not appear to be a git repository."
  exit 1
fi

echo "==> Creating clean feature branch in $TARGET_REPO..."
cd "$TARGET_REPO" || exit 1
git checkout -b feature/gemini-knowledge-hub 2>/dev/null || git checkout feature/gemini-knowledge-hub

echo "==> Creating webapp/ directory in repository..."
mkdir -p "$TARGET_REPO/webapp"

echo "==> Copying web application files..."
cd - > /dev/null || exit 1
cp -r src/ "$TARGET_REPO/webapp/"
cp -r public/ "$TARGET_REPO/webapp/" 2>/dev/null || true
cp package.json tsconfig.json vite.config.ts index.html server.ts "$TARGET_REPO/webapp/"

echo "==> Copying audit logs..."
cp gemini_prompts.md "$TARGET_REPO/"
cp gemini_feedback.md "$TARGET_REPO/"

echo "==> Checking git status..."
cd "$TARGET_REPO" || exit 1
git status

echo "--------------------------------------------------------"
echo "Done! You can now review changes and commit safely:"
echo "  git add webapp/ gemini_prompts.md gemini_feedback.md"
echo "  git commit -m 'feat: add Learn Better Knowledge Hub and AI vibe coding guide'"
echo "  git push -u origin feature/gemini-knowledge-hub"
echo "--------------------------------------------------------"
