"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useState } from "react"

interface DashboardHeaderProps {
    name: string | null
    image: string | null
}

export function DashboardHeader({ name, image }: DashboardHeaderProps) {
    const router = useRouter()
    const [isSigningOut, setIsSigningOut] = useState(false)

    const handleSignOut = async () => {
        setIsSigningOut(true)
        await authClient.signOut()
        router.push("/login")
    }

    return (
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                {image ? (
                    <Image
                        src={image}
                        alt={name || "User"}
                        className="h-full w-full object-cover"
                        height={32}
                        width={32}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                        {name?.[0] || "U"}
                    </div>
                )}
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="h-8 w-8"
            >
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    )
}
