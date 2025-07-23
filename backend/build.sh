#!/bin/bash

echo "🔧 Running Prisma generate..."
npx prisma generate --schema=prisma/schema.prisma

echo "📤 Pushing Prisma DB schema..."
npx prisma db push --schema=prisma/schema.prisma

echo "🏗 Building NestJS..."
npx nest build
