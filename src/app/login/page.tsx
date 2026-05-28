"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { GraduationCap, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden animated-gradient-bg p-4">
      {/* Decorative floating elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute left-1/3 top-1/4 h-48 w-48 rounded-full bg-teal-300/8 blur-2xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="glass glass-border rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20">
          <div className="px-8 pt-8 pb-2 text-center">
            {/* Logo */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg shadow-lg shadow-teal-500/25">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">English Learning</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your Yasin learning system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-8 pt-4">
            {error && (
              <div className="animate-slide-down rounded-lg bg-destructive/8 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg border-muted-foreground/20 bg-background/50 transition-all duration-200 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:bg-background placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg border-muted-foreground/20 bg-background/50 transition-all duration-200 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 focus:bg-background placeholder:text-muted-foreground/50"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg gradient-bg text-white font-medium shadow-lg shadow-teal-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30 hover:brightness-110 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
