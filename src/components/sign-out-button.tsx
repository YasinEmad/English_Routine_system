"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="h-8 gap-2 text-muted-foreground hover:text-destructive transition-colors duration-200"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span className="text-xs">Sign Out</span>
    </Button>
  )
}
