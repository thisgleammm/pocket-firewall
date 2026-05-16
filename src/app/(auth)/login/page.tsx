"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2, ShieldCheck, Mail, ArrowRight } from "lucide-react"

function getErrorMessage(error: unknown): string {
    if (typeof error === "string") {
        const msg = error.toLowerCase()
        if (msg.includes("invalid") || msg.includes("credential")) return "Email atau kata sandi salah"
        if (msg.includes("already") || msg.includes("registered") || msg.includes("duplicate")) return "Email sudah terdaftar"
        return error
    }
    if (error && typeof error === "object" && "message" in error) {
        return getErrorMessage((error as { message: string }).message)
    }
    return "Terjadi kesalahan. Coba lagi."
}

const PasswordField = ({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) => {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <div className="flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
                <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kata Sandi</Label>
                {id === "login-password" && (
                    <a href="#" className="text-xs text-primary hover:underline font-medium">Lupa sandi?</a>
                )}
            </div>
            <div className="relative group">
                <Input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10 h-12 bg-muted/50 border-transparent focus:border-primary transition-all duration-300"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    )
}

export default function LoginPage() {
    const router = useRouter()
    const [tab, setTab] = useState("login")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    const [signupName, setSignupName] = useState("")
    const [signupEmail, setSignupEmail] = useState("")
    const [signupPassword, setSignupPassword] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)
        try {
            const result = await authClient.signIn.email({
                email: loginEmail,
                password: loginPassword,
            })
            if (result.error) {
                setError(getErrorMessage(result.error))
            } else {
                router.push("/")
            }
        } catch {
            setError("Terjadi kesalahan. Coba lagi.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)
        try {
            const result = await authClient.signUp.email({
                name: signupName,
                email: signupEmail,
                password: signupPassword,
            })
            if (result.error) {
                setError(getErrorMessage(result.error))
            } else {
                router.push("/")
            }
        } catch {
            setError("Terjadi kesalahan. Coba lagi.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogle = async () => {
        setError(null)
        setIsLoading(true)
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
            })
        } catch {
            setError("Gagal masuk dengan Google.")
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-background selection:bg-primary/20">
            {/* Left Panel - Premium Editorial Branding */}
            <div className="hidden lg:flex w-[45%] bg-zinc-950 p-12 text-zinc-50 flex-col justify-between relative overflow-hidden border-r border-border/10">
                {/* Abstract Topographic/Grid Background */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)' , backgroundSize: '32px 32px' }}></div>
                
                {/* Glow effects */}
                <div className="absolute -left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] mix-blend-screen pointer-events-none"></div>
                <div className="absolute right-[-10%] bottom-[-10%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">PocketFirewall</span>
                </div>
                
                <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 delay-150 fill-mode-both">
                    <h1 className="text-5xl xl:text-6xl font-bold tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">
                        Keamanan Finansial <br /> Tanpa Kompromi.
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-md leading-relaxed font-light">
                        Arsitektur pelacakan keuangan yang dibangun dengan presisi. Pantau arus kas, amankan aset, dan ambil kendali penuh atas masa depan Anda.
                    </p>
                </div>
                
                <div className="relative z-10 flex items-center justify-between text-sm text-zinc-600 animate-in fade-in duration-1000 delay-300 fill-mode-both">
                    <p>© 2026 Hak Cipta Dilindungi</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-zinc-300 transition-colors">Privasi</a>
                        <a href="#" className="hover:text-zinc-300 transition-colors">Ketentuan</a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Area */}
            <div className="flex w-full lg:w-[55%] items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="absolute top-8 left-8 flex lg:hidden items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">PocketFirewall</span>
                </div>

                <div className="w-full max-w-[420px] space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Selamat Datang</h2>
                        <p className="text-muted-foreground">Masuk atau buat akun baru untuk melanjutkan</p>
                    </div>

                    <Tabs value={tab} onValueChange={setTab} className="w-full">
                        <TabsList className="w-full h-12 p-1 bg-muted/50 rounded-xl mb-8">
                            <TabsTrigger value="login" className="flex-1 rounded-lg transition-all data-[state=active]:shadow-sm">Masuk</TabsTrigger>
                            <TabsTrigger value="signup" className="flex-1 rounded-lg transition-all data-[state=active]:shadow-sm">Daftar Baru</TabsTrigger>
                        </TabsList>

                        {error && (
                            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-destructive text-xs font-bold">!</span>
                                </div>
                                <p className="text-sm text-destructive font-medium leading-relaxed">{error}</p>
                            </div>
                        )}

                        <TabsContent value="login" className="space-y-6 mt-0">
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                                    <div className="relative">
                                        <Input
                                            id="login-email"
                                            type="email"
                                            placeholder="nama@email.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                            className="h-12 pl-10 bg-muted/50 border-transparent focus:border-primary transition-all duration-300"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <PasswordField id="login-password" value={loginPassword} onChange={setLoginPassword} />
                                <Button type="submit" className="w-full h-12 text-base font-medium mt-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Lanjutkan <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-6 mt-0">
                            <form onSubmit={handleSignup} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Lengkap</Label>
                                    <Input
                                        id="signup-name"
                                        type="text"
                                        placeholder="Ketik nama Anda"
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        required
                                        className="h-12 bg-muted/50 border-transparent focus:border-primary transition-all duration-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                                    <div className="relative">
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="nama@email.com"
                                            value={signupEmail}
                                            onChange={(e) => setSignupEmail(e.target.value)}
                                            required
                                            className="h-12 pl-10 bg-muted/50 border-transparent focus:border-primary transition-all duration-300"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <PasswordField id="signup-password" value={signupPassword} onChange={setSignupPassword} />
                                <Button type="submit" className="w-full h-12 text-base font-medium mt-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Buat Akun <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        </TabsContent>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border/60" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-background px-4 text-muted-foreground/60 font-medium uppercase tracking-widest">Atau lanjutkan dengan</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 gap-3 font-medium bg-background hover:bg-muted/50 border-border/60 transition-all"
                            onClick={handleGoogle}
                            disabled={isLoading}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                            Google
                        </Button>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
