#!/bin/bash

echo "🔧 Running Prisma generate..."
npx --yes prisma generate --schema=prisma/schema.prisma

echo "📤 Pushing Prisma DB schema..."
npx --yes prisma db push --schema=prisma/schema.prisma

echo "🏗 Building NestJS..."
npx --yes nest build
