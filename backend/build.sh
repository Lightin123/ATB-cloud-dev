#!/bin/bash

set -e

echo "🔧 Running Prisma generate..."
npx prisma generate

echo "📤 Pushing Prisma DB schema..."
npx prisma db push --schema=backend/prisma/schema.prisma

echo "🏗 Building NestJS..."
npm run build:nest
