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
      <div className="overflow-hidden rounded-[1rem] border border-border/70 bg-card shadow-[0_10px_24px_rgba(77,57,39,0.08)]">
        <div className="h-10 w-10 overflow-hidden rounded-[0.9rem]">
          {image ? (
            <Image
              src={image}
              alt={name || "User"}
              className="h-full w-full object-cover"
              height={40}
              width={40}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/18 text-sm font-bold text-foreground">
              {name?.[0] || "U"}
            </div>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="h-10 w-10 rounded-[1rem] border border-border/70 bg-card text-foreground/72 hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
