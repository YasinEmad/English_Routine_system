import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
  config({ path: new URL('../../.env', import.meta.url).pathname })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db