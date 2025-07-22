#!/bin/bash

echo "🔧 Running Prisma generate..."
node_modules/.bin/prisma generate --schema=prisma/schema.prisma

echo "📤 Pushing Prisma DB schema..."
node_modules/.bin/prisma db push --schema=prisma/schema.prisma

echo "🏗 Building NestJS..."
npm run build:nest
