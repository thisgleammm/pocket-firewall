import { CategoryManager } from "@/components/category-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listCategoriesForUser } from "@/lib/categories"
import { requireServerSession } from "@/lib/session"

export default async function CategoriesPage() {
  const session = await requireServerSession()
  const categories = await listCategoriesForUser(session.user.id)

  const expenseCategories = categories.filter((category) => category.type === "EXPENSE")
  const incomeCategories = categories.filter((category) => category.type === "INCOME")

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="text-2xl font-semibold">Kategori</h2>
        <p className="text-sm text-muted-foreground">
          Kelola kategori bawaan dan kategori custom.
        </p>
      </div>

      <CategoryManager />

      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {category.name}
                {category.isDefault ? " • default" : ""}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pemasukan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {category.name}
                {category.isDefault ? " • default" : ""}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
