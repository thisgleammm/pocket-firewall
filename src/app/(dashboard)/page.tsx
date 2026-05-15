import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="p-4 flex flex-col gap-6">
            <section className="grid grid-cols-1 gap-4">
                <Card className="bg-primary text-primary-foreground overflow-hidden relative">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Total Saldo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">Rp 5.250.000</div>
                        <div className="mt-4 flex gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider opacity-70">Pemasukan</p>
                                <p className="text-sm font-semibold">Rp 8.000.000</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wider opacity-70">Pengeluaran</p>
                                <p className="text-sm font-semibold">Rp 2.750.000</p>
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="h-24 w-24" />
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="text-lg font-bold mb-4">Transaksi Terakhir</h2>
                <div className="flex flex-col gap-3">
                    {[
                        { title: "Gaji Bulanan", category: "Gaji", amount: 8000000, type: "INCOME", date: "Hari ini" },
                        { title: "Nasi Padang", category: "Makan", amount: 25000, type: "EXPENSE", date: "Hari ini" },
                        { title: "Ojek Online", category: "Transport", amount: 15000, type: "EXPENSE", date: "Kemarin" },
                        { title: "Listrik", category: "Tagihan", amount: 250000, type: "EXPENSE", date: "14 Mei" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-card border shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${item.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {item.type === 'INCOME' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">{item.category} • {item.date}</p>
                                </div>
                            </div>
                            <div className={`font-bold ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.type === 'INCOME' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
