#!/usr/bin/env bash
set -o errexit -o nounset

# 1 Activate the exact Yarn your package.json asks for
corepack enable
corepack prepare "yarn@4.4.1" --activate   # keep version in sync with package.json

# 2 Install deps exactly as in CI
yarn install --immutable

# 3 Build the Vite production bundle
yarn build
