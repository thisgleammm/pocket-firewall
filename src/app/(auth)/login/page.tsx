"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Eye, EyeOff, Loader2 } from "lucide-react"

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

export default function LoginPage() {
    const [tab, setTab] = useState("login")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

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
                callbackURL: "/",
            })
            if (result.error) {
                setError(getErrorMessage(result.error))
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
                callbackURL: "/",
            })
            if (result.error) {
                setError(getErrorMessage(result.error))
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

    const PasswordField = ({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) => (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>Kata Sandi</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">PocketFirewall</CardTitle>
                    <CardDescription>
                        Kontrol keuangan Anda dengan presisi tinggi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={tab} onValueChange={setTab}>
                        <TabsList variant="default" className="w-full mb-6">
                            <TabsTrigger value="login" className="flex-1">Masuk</TabsTrigger>
                            <TabsTrigger value="signup" className="flex-1">Daftar</TabsTrigger>
                        </TabsList>

                        {error && (
                            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <PasswordField id="login-password" value={loginPassword} onChange={setLoginPassword} />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Masuk
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="signup-name">Nama</Label>
                                    <Input
                                        id="signup-name"
                                        type="text"
                                        placeholder="Nama Anda"
                                        value={signupName}
                                        onChange={(e) => setSignupName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <PasswordField id="signup-password" value={signupPassword} onChange={setSignupPassword} />
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    Daftar
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">atau</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleGoogle}
                        disabled={isLoading}
                    >
                        <Globe className="h-5 w-5" />
                        Masuk dengan Google
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground">
                        Dengan {tab === "signup" ? "mendaftar" : "masuk"}, Anda menyetujui Ketentuan Layanan kami.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
