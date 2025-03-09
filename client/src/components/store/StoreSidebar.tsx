"use client"

import type React from "react"

import { useAuthStore } from "@/store/authStore"
import { ClipboardList, Home, LogOut, Package, Settings, ShoppingCart, Store, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface StoreLayoutProps {
  children: React.ReactNode
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { logout } = useAuthStore()
  const { user } = useAuthStore()
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/store", icon: Home },
    { name: "Manage Invenotry", href: "/inventory", icon: Package },
    { name: "Build Store", href: "/store/builder", icon: ClipboardList },
    { name: "Explore stores", href: "/store/stores", icon: Store },
    { name: "Settings", href: "/store/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0 border-right border-r border-gray-800">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-gradient-to-br from-indigo-900 to-blue-900 dark:bg-gradient dark:from-black">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <ShoppingCart className="h-8 w-8 mr-2 text-white" />
              <span className="text-xl font-bold text-white">My Store</span>
            </div>
            <div className="flex flex-col flex-grow">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "dark:bg-zinc-800 bg-blue-950 text-white"
                        : "text-primary-foreground/70 text-gray-200 hover:bg-primary-foreground/10 hover:text-white",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t bg-white dark:bg-zinc-900 border-primary-foreground/20 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center w-full text-sm text-left">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/placeholder-user.jpg" alt={user?.username || "User"} />
                    <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.username || "User"}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
