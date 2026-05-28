"use client"

import { type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface PageHeaderProps {
  title: string
  description: string
  icon: LucideIcon
  gradient: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, gradient, children }: PageHeaderProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className={`relative ${gradient}`}>
        {/* Decorative shape */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 dark:bg-white/3 blur-xl" />
          <div className="absolute right-8 bottom-0 h-16 w-16 rounded-full bg-white/3 dark:bg-white/2 blur-lg" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 dark:bg-white/10 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
              <p className="text-sm text-white/70 mt-0.5">{description}</p>
            </div>
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      </div>
    </Card>
  )
}
