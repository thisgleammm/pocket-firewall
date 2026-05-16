import { DashboardHeader } from "@/components/dashboard-header"
import { InstallPwaBanner } from "@/components/install-pwa-banner"
import { Button } from "@/components/ui/button"
import { requireServerSession } from "@/lib/session"
import { Home, List, PieChart, Settings, Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireServerSession()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/88 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Utility ledger
            </p>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              PocketFW
            </h1>
          </div>
          <DashboardHeader
            name={session.user.name}
            image={session.user.image ?? null}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 pb-24">
        <div className="w-full">{children}</div>
      </main>

      <InstallPwaBanner />

      <nav className="fixed inset-x-0 bottom-0 z-20 bg-transparent px-3 pb-3 safe-area-pb">
        <div className="mx-auto flex h-[4.6rem] max-w-md items-center justify-around rounded-[1.6rem] border border-border/80 bg-card/94 px-2 shadow-[0_24px_60px_rgba(77,57,39,0.16)] backdrop-blur-xl">
          <Link
            href="/"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
              Beranda
            </span>
          </Link>
          <Link
            href="/transactions"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <List className="h-5 w-5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
              Transaksi
            </span>
          </Link>
          <div className="relative -top-5">
            <Button
              asChild
              size="icon"
              className="h-14 w-14 rounded-[1.25rem] shadow-[0_18px_40px_rgba(145,70,29,0.24)]"
            >
              <Link
                href="/transactions#new-transaction"
                aria-label="Tambah transaksi"
              >
                <Plus className="h-7 w-7" />
              </Link>
            </Button>
          </div>
          <Link
            href="/reports"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <PieChart className="h-5 w-5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
              Laporan
            </span>
          </Link>
          <Link
            href="/categories"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
              Kategori
            </span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
