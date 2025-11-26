#!/bin/sh
set -e         

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma-auth/schema.prisma
exec node dist/main.js        