import { PrismaClient, TransactionType } from "@prisma/client"

import { DEFAULT_CATEGORY_NAMES } from "../src/lib/finance.ts"

const prisma = new PrismaClient()

async function main() {
  const existingDefaults = await prisma.category.findMany({
    select: {
      name: true,
      type: true,
    },
    where: {
      isDefault: true,
      userId: null,
    },
  })

  const existingKeys = new Set(
    existingDefaults.map((category) => `${category.type}:${category.name}`)
  )

  const missing = Object.entries(DEFAULT_CATEGORY_NAMES).flatMap(([type, names]) =>
    names
      .filter((name) => !existingKeys.has(`${type}:${name}`))
      .map((name) => ({
        isDefault: true,
        name,
        type: type as TransactionType,
        userId: null,
      }))
  )

  if (missing.length > 0) {
    await prisma.category.createMany({
      data: missing,
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
