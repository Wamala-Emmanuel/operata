#!/bin/sh
set -e         

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=/app/prisma-payment/schema.prisma
exec node dist/main.js        