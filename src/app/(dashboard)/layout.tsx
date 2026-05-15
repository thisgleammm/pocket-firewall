import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, List, PieChart, Settings, Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
                <h1 className="font-bold text-xl tracking-tight">PocketFW</h1>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                        {session.user.image ? (
                            <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                                {session.user.name?.[0] || "U"}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 pb-20">
                {children}
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/80 backdrop-blur-lg safe-area-pb">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    <Link href="/" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <Home className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Beranda</span>
                    </Link>
                    <Link href="/transactions" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <List className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Transaksi</span>
                    </Link>
                    <div className="relative -top-5">
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg shadow-primary/20">
                            <Plus className="h-8 w-8" />
                        </Button>
                    </div>
                    <Link href="/reports" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <PieChart className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Laporan</span>
                    </Link>
                    <Link href="/categories" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                        <Settings className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Kategori</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
