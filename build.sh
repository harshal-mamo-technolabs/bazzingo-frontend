#!/bin/bash
# filepath: c:\Users\Admin\Desktop\bazzingo-frontend\build.sh

echo "Installing corepack..."
npm install -g corepack

echo "Enabling corepack..."
corepack enable

echo "Preparing Yarn 4.4.1..."
corepack prepare yarn@4.4.1 --activate

echo "Yarn version after setup:"
yarn --version

echo "Installing dependencies..."
yarn install

echo "Building project..."
yarn build