"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"

export default function LoginPage() {
    const handleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">PocketFirewall</CardTitle>
                    <CardDescription>
                        Kontrol keuangan Anda dengan presisi tinggi.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button 
                        size="lg" 
                        className="w-full gap-2" 
                        onClick={handleLogin}
                    >
                        <Globe className="h-5 w-5" />
                        Masuk dengan Google
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground">
                        Dengan masuk, Anda menyetujui Ketentuan Layanan kami.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
