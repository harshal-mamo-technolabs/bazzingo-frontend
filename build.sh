#!/bin/bash
# filepath: c:\Users\Admin\Desktop\bazzingo-frontend\build.sh

echo "Setting up for Render deployment..."
# Use the Render-specific package.json
cp package.json.render package.json

echo "Installing dependencies with npm..."
npm install

echo "Building project..."
npm run build