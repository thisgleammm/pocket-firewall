"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  Loader2,
  ScanLine,
  Shield,
  WalletCards,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type AuthTab = "login" | "signup"

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

function StatusChip({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-full border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.24em]",
        className
      )}
    >
      {children}
    </div>
  )
}

function SignalCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-black/10 bg-black/[0.045] p-3 shadow-[0_12px_30px_rgba(17,17,17,0.08)]">
      <div className="mb-6 inline-flex rounded-full border border-black/10 bg-white/50 p-2">
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-black/55">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-black/90">{value}</p>
    </div>
  )
}

function FieldShell({
  children,
  label,
  htmlFor,
}: {
  children: React.ReactNode
  htmlFor: string
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/66"
        htmlFor={htmlFor}
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

function PasswordField({
  id,
  onChange,
  onToggle,
  placeholder,
  showPassword,
  value,
}: {
  id: string
  onChange: (value: string) => void
  onToggle: () => void
  placeholder: string
  showPassword: boolean
  value: string
}) {
  return (
    <FieldShell htmlFor={id} label="Kata Sandi">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          minLength={8}
          autoComplete={id.includes("signup") ? "new-password" : "current-password"}
          className="h-14 rounded-2xl border-white/12 bg-white/[0.07] px-4 pr-14 text-[15px] text-white placeholder:text-white/36 focus-visible:border-[#f16d3b] focus-visible:ring-[#f16d3b]/20"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute inset-y-1 right-1 flex w-12 items-center justify-center rounded-[1rem] text-white/46 transition-colors hover:bg-white/8 hover:text-white"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FieldShell>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<AuthTab>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")

  const isSignup = tab === "signup"

  const modeCopy = isSignup
    ? {
        kicker: "Onboard cepat",
        subtitle: "Bikin akun, simpan saldo, mulai catat hari ini juga.",
        submitLabel: "Buat Akun",
      }
    : {
        kicker: "Akses harian",
        subtitle: "Masuk cepat buat cek saldo dan catat transaksi sebelum lupa.",
        submitLabel: "Masuk Sekarang",
      }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
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

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault()
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
        callbackURL: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
      })
    } catch {
      setError("Gagal masuk dengan Google.")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#f4e7d7] text-[#111111]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(241,109,59,0.22),transparent_28%),radial-gradient(circle_at_85%_14%,rgba(17,17,17,0.08),transparent_24%),linear-gradient(180deg,#f7ecd8_0%,#ead9c1_100%)]" />
      <div className="absolute inset-x-[-18%] top-8 rotate-[-5deg] border-y border-black/10 bg-[#f16d3b] py-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-black">
        pocket firewall pocket firewall pocket firewall
      </div>
      <div className="absolute -left-16 bottom-24 h-40 w-40 rounded-full bg-[#111111]/8 blur-3xl" />
      <div className="absolute -right-10 top-36 h-48 w-48 rounded-full bg-[#f16d3b]/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col pt-14 lg:grid lg:grid-cols-[1.06fr_0.94fr] lg:gap-8 lg:px-6 lg:py-6">
        <section className="flex flex-col px-4 pb-7 pt-8 sm:px-6 lg:justify-between lg:px-2 lg:pb-10 lg:pt-20">
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="mb-5 flex flex-wrap gap-2">
              <StatusChip className="border-black/12 bg-white/46 text-black/76">
                Budget under watch
              </StatusChip>
              <StatusChip className="border-black/12 bg-black text-[#f6e9d7]">
                Android home ready
              </StatusChip>
            </div>

            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-black/58">
                Mobile control room
              </p>
              <h1 className="mt-3 text-[3.2rem] font-black uppercase leading-[0.9] tracking-[-0.06em] text-[#111111] sm:text-[4.6rem]">
                Stop money leaks
                <span className="block text-[#8f3a1a]">before they spread.</span>
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-6 text-black/68 sm:text-base">
                PocketFirewall bikin catat pemasukan dan pengeluaran terasa cepat,
                jelas, dan cukup aman buat jadi ritual harian.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-5 duration-700 lg:max-w-xl">
            <SignalCard icon={WalletCards} label="Flow" value="Input cepat, satu layar" />
            <SignalCard icon={ScanLine} label="Signal" value="Saldo dan tren kebaca" />
            <SignalCard icon={Shield} label="Guard" value="Data harian tetap rapih" />
          </div>
        </section>

        <section className="mt-auto rounded-t-[2rem] border-t border-black/12 bg-[#121212] text-[#f8efe1] shadow-[0_-24px_80px_rgba(17,17,17,0.16)] animate-in fade-in slide-in-from-bottom-8 duration-700 lg:mt-0 lg:rounded-[2.2rem] lg:border lg:border-white/8 lg:shadow-[0_36px_120px_rgba(17,17,17,0.32)]">
          <div className="px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#f16d3b]">
                  {modeCopy.kicker}
                </p>
                <h2 className="mt-2 text-[1.9rem] font-black uppercase leading-[0.95] tracking-[-0.05em] text-white">
                  {isSignup ? "Aktifkan panel baru" : "Masuk ke panel harian"}
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
                  {modeCopy.subtitle}
                </p>
              </div>
              <div className="hidden rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-3 text-white/80 sm:block">
                <Fingerprint className="h-6 w-6" />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(nextValue) => setTab(nextValue === "signup" ? "signup" : "login")} className="gap-5">
              <TabsList
                variant="default"
                className="grid h-auto w-full grid-cols-2 rounded-[1.45rem] border border-white/8 bg-white/[0.05] p-1.5"
              >
                <TabsTrigger
                  value="login"
                  className="h-12 rounded-[1rem] text-[15px] font-semibold text-white/62 data-active:bg-[#f3e4ce] data-active:text-[#111111]"
                >
                  Masuk
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="h-12 rounded-[1rem] text-[15px] font-semibold text-white/62 data-active:bg-[#f3e4ce] data-active:text-[#111111]"
                >
                  Daftar
                </TabsTrigger>
              </TabsList>

              {error ? (
                <div
                  aria-live="polite"
                  className="rounded-[1.35rem] border border-[#f16d3b]/35 bg-[#f16d3b]/12 px-4 py-3 text-sm leading-6 text-[#ffd5c2]"
                >
                  {error}
                </div>
              ) : null}

              <TabsContent value="login" className="mt-0 outline-none">
                <form onSubmit={handleLogin} className="space-y-4">
                  <FieldShell htmlFor="login-email" label="Email">
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      autoCapitalize="none"
                      autoComplete="email"
                      inputMode="email"
                      required
                      className="h-14 rounded-2xl border-white/12 bg-white/[0.07] px-4 text-[15px] text-white placeholder:text-white/36 focus-visible:border-[#f16d3b] focus-visible:ring-[#f16d3b]/20"
                    />
                  </FieldShell>

                  <PasswordField
                    id="login-password"
                    onChange={setLoginPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    placeholder="Minimal 8 karakter"
                    showPassword={showPassword}
                    value={loginPassword}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 h-14 w-full rounded-2xl bg-[#f16d3b] text-[15px] font-semibold text-[#111111] shadow-[0_14px_36px_rgba(241,109,59,0.24)] hover:bg-[#e96534]"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                    {modeCopy.submitLabel}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 outline-none">
                <form onSubmit={handleSignup} className="space-y-4">
                  <FieldShell htmlFor="signup-name" label="Nama">
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Nama Anda"
                      value={signupName}
                      onChange={(event) => setSignupName(event.target.value)}
                      autoComplete="name"
                      required
                      className="h-14 rounded-2xl border-white/12 bg-white/[0.07] px-4 text-[15px] text-white placeholder:text-white/36 focus-visible:border-[#f16d3b] focus-visible:ring-[#f16d3b]/20"
                    />
                  </FieldShell>

                  <FieldShell htmlFor="signup-email" label="Email">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={signupEmail}
                      onChange={(event) => setSignupEmail(event.target.value)}
                      autoCapitalize="none"
                      autoComplete="email"
                      inputMode="email"
                      required
                      className="h-14 rounded-2xl border-white/12 bg-white/[0.07] px-4 text-[15px] text-white placeholder:text-white/36 focus-visible:border-[#f16d3b] focus-visible:ring-[#f16d3b]/20"
                    />
                  </FieldShell>

                  <PasswordField
                    id="signup-password"
                    onChange={setSignupPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    placeholder="Bikin kata sandi kuat"
                    showPassword={showPassword}
                    value={signupPassword}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 h-14 w-full rounded-2xl bg-[#f16d3b] text-[15px] font-semibold text-[#111111] shadow-[0_14px_36px_rgba(241,109,59,0.24)] hover:bg-[#e96534]"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                    {modeCopy.submitLabel}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#121212] px-3 font-mono text-[10px] uppercase tracking-[0.26em] text-white/38">
                  atau lanjut dengan
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="h-14 w-full rounded-2xl border-white/12 bg-white/[0.03] text-[15px] font-medium text-white hover:bg-white/[0.08] hover:text-white"
              onClick={handleGoogle}
              disabled={isLoading}
            >
              <Globe className="h-5 w-5" />
              Masuk dengan Google
            </Button>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5 text-xs leading-6 text-white/42">
              <p>Maks 1 menit dari buka app sampai siap catat.</p>
              <p>Dengan lanjut, Anda setuju ke aturan layanan.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
