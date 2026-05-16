import { TransactionType, type Category } from "@prisma/client"

import { prisma } from "@/lib/db"
import { DEFAULT_CATEGORY_NAMES } from "@/lib/finance"

const CATEGORY_SORT_ORDER = new Map([
  ["Gaji", 1],
  ["Freelance", 2],
  ["Investasi", 3],
  ["Makan", 1],
  ["Transport", 2],
  ["Kesehatan", 3],
  ["Belanja", 4],
  ["Hiburan", 5],
  ["Tagihan", 6],
  ["Lainnya", 99],
])

export async function ensureDefaultCategories() {
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

export async function listCategoriesForUser(
  userId: string,
  type?: TransactionType
) {
  await ensureDefaultCategories()

  const categories = await prisma.category.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    where: {
      ...(type ? { type } : {}),
      OR: [
        { isDefault: true, userId: null },
        { userId },
      ],
    },
  })

  return categories.sort(sortCategories)
}

export async function findCategoryForUser(userId: string, categoryId: string) {
  await ensureDefaultCategories()

  return prisma.category.findFirst({
    where: {
      id: categoryId,
      OR: [
        { isDefault: true, userId: null },
        { userId },
      ],
    },
  })
}

function sortCategories(left: Category, right: Category) {
  if (left.type !== right.type) {
    return left.type === "EXPENSE" ? -1 : 1
  }

  if (left.isDefault !== right.isDefault) {
    return left.isDefault ? -1 : 1
  }

  const leftOrder = CATEGORY_SORT_ORDER.get(left.name) ?? 50
  const rightOrder = CATEGORY_SORT_ORDER.get(right.name) ?? 50

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  return left.name.localeCompare(right.name, "id")
}
