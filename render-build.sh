#!/usr/bin/env bash
set -o errexit -o nounset

# Explicitly enable Corepack (required for yarn >=2)
corepack enable
corepack prepare "yarn@4.4.1" --activate

# Install dependencies exactly as defined (immutable)
yarn install --immutable

# Build the React Vite project
yarn build
