#!/bin/bash

# Pack all tldraw packages for Miyagi3
# Run this script whenever you make changes to your tldraw fork

set -e  # Exit on any error

# yarn install

# List of packages to pack
packages=(
  "tldraw"
  "sync" 
  "editor"
  "store"
  "state"
  "utils"
  "sync-core"
  "state-react"
  "tlschema"
  "validate"
)

echo "🔨 Building packages in parallel..."
build_pids=()
for pkg in "${packages[@]}"; do
  echo "  🔨 Starting build for @tldraw/$pkg..."
  (
    cd "packages/$pkg"
    yarn build
  ) &
  build_pids+=($!)
done

echo "⏳ Waiting for all builds to complete..."
for pid in "${build_pids[@]}"; do
  wait $pid
  if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
  fi
done
echo "✅ All builds completed!"

echo "📦 Packing tldraw packages..."

# Pack each package sequentially
for pkg in "${packages[@]}"; do
  echo "  📦 Packing @tldraw/$pkg..."
  cd "packages/$pkg"
  yarn pack > /dev/null 2>&1
  cd ../..
done

echo "📋 Copying packages to Miyagi3..."

# Copy to Miyagi3 vendor directory
MIYAGI_VENDOR="/Users/donalddellapietra/GitHub/Miyagi3/vendor"
mkdir -p "$MIYAGI_VENDOR"

cp "packages/tldraw/package.tgz" "$MIYAGI_VENDOR/tldraw.tgz"
cp "packages/sync/package.tgz" "$MIYAGI_VENDOR/tldraw-sync.tgz"
cp "packages/editor/package.tgz" "$MIYAGI_VENDOR/tldraw-editor.tgz"
cp "packages/store/package.tgz" "$MIYAGI_VENDOR/tldraw-store.tgz"
cp "packages/state/package.tgz" "$MIYAGI_VENDOR/tldraw-state.tgz"
cp "packages/utils/package.tgz" "$MIYAGI_VENDOR/tldraw-utils.tgz"
cp "packages/sync-core/package.tgz" "$MIYAGI_VENDOR/tldraw-sync-core.tgz"
cp "packages/state-react/package.tgz" "$MIYAGI_VENDOR/tldraw-state-react.tgz"
cp "packages/tlschema/package.tgz" "$MIYAGI_VENDOR/tldraw-tlschema.tgz"
cp "packages/validate/package.tgz" "$MIYAGI_VENDOR/tldraw-validate.tgz"

echo "🧹 Cleaning up..."
# Remove the .tgz files from tldraw packages
for pkg in "${packages[@]}"; do
  rm -f "packages/$pkg/package.tgz"
done

echo "✅ Done! All packages copied to Miyagi3."
echo ""
echo "📝 Next steps:"
echo "   cd /Users/donalddellapietra/GitHub/Miyagi3"
echo "   pnpm install"
echo ""
echo "🔄 To update after making changes:"
echo "   cd /Users/donalddellapietra/GitHub/tldraw"
echo "   ./pack-for-miyagi.sh"
