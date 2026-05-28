"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Headphones,
  Mic,
  BookOpen,
  RotateCcw,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "@/components/sign-out-button"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Listening",
    href: "/listening",
    icon: Headphones,
  },
  {
    title: "Speaking",
    href: "/speaking",
    icon: Mic,
  },
  {
    title: "Vocabulary",
    href: "/vocabulary",
    icon: BookOpen,
  },
  {
    title: "Review Mistakes",
    href: "/review",
    icon: RotateCcw,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const userName = session?.user?.name || "User"

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/50 px-5 py-4">
        <Link href="/" className="flex items-center gap-1 group">
          <div className="relative rounded-lg shadow-sm group-hover:scale-105">
            <Image src="/logo.png" alt="English Learning logo" width={41} height={41} className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight gradient-text">English Learning</span>
            <span className="text-[10px] text-muted-foreground/70">Yasin Learning System</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        group relative rounded-lg transition-all duration-200
                        ${isActive
                          ? "bg-teal-500/10 text-teal-700 dark:text-teal-400 font-medium"
                          : "hover:bg-accent/60"
                        }
                      `}
                    >
                      <Link href={item.href}>
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full gradient-bg" />
                        )}
                        <item.icon className={`h-4 w-4 transition-colors duration-200 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground group-hover:text-foreground"}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-3">
        <div className="flex items-center gap-2 mb-2 px-2">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarFallback className="bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{session?.user?.email || ""}</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-accent/30 px-2 py-1.5">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
