"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { shouldShowInstallPrompt } from "@/lib/pwa"

const DISMISS_KEY = "pocketfw-install-dismissed"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia("(display-mode: standalone)").matches
}

export function InstallPwaBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.localStorage.getItem(DISMISS_KEY) === "true"
  })
  const [installed, setInstalled] = useState(false)
  const [standalone] = useState(() => isStandaloneMode())
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }

    function handleInstalled() {
      setInstalled(true)
      setPromptEvent(null)
      window.localStorage.removeItem(DISMISS_KEY)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  async function handleInstall() {
    if (!promptEvent) {
      return
    }

    setIsInstalling(true)

    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice

      if (choice.outcome === "accepted") {
        setInstalled(true)
        setPromptEvent(null)
      }
    } finally {
      setIsInstalling(false)
    }
  }

  function handleDismiss() {
    window.localStorage.setItem(DISMISS_KEY, "true")
    setDismissed(true)
  }

  if (
    !shouldShowInstallPrompt({
      dismissed,
      hasPrompt: Boolean(promptEvent),
      installed,
      standalone,
    })
  ) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-20 z-30 mx-auto max-w-md rounded-2xl border border-border bg-background/96 p-4 shadow-[0_20px_50px_rgba(17,17,17,0.18)] backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Install PocketFW</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Simpan ke home screen. Buka lebih cepat, rasa app lebih native.
          </p>
          <div className="mt-3 flex gap-2">
            <Button className="h-10" disabled={isInstalling} onClick={handleInstall}>
              {isInstalling ? "Memasang..." : "Install"}
            </Button>
            <Button className="h-10" onClick={handleDismiss} variant="outline">
              Nanti
            </Button>
          </div>
        </div>
        <button
          aria-label="Tutup prompt install"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={handleDismiss}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
