"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { Home, FileText, PlusCircle, Settings, Info, ShoppingBag, Heart, ChevronRight, PieChart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const GigsSidebar = () => {
  const { user } = useAuthStore()
  const pathname = usePathname()

  const navItems = [
    { href: "/gigs", label: "Home", icon: Home },
    { href: "/gigs/gig", label: "All Gigs", icon: FileText },
    ...(user
      ? [
        { href: "/gigs/dashboard", label: "Dashboard", icon: PieChart },
          { href: "/gigs/orders", label: "Your Orders", icon: ShoppingBag },
          { href: "/gigs/create-gig", label: "Create Gig", icon: PlusCircle, highlight: true },
        ]
      : []),
  ]

  const secondaryNavItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/about", label: "About", icon: Info },
  ]

  return (
    <aside className="w-64 h-screen bg-white dark:bg-black sticky top-0 flex flex-col overflow-y-auto border-r border-gray-300 dark:border-gray-800">
     

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3">
        <div className="mb-1 px-3">
          <p className="text-lg mb-6 font-medium text-blue-600 dark:text-white uppercase tracking-wider">Navigation</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm group transition-colors
                  ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : item.highlight
                      ? "text-primary hover:bg-primary/5"
                      : "text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }
                `}
              >
                <item.icon
                  className={`w-4 h-4 mr-3 ${isActive ? "text-primary" : "text-neutral-500 group-hover:text-neutral-700"}`}
                />
                <span>{item.label}</span>
                {!isActive && item.highlight && (
                  <Badge className="ml-auto bg-primary/10 text-primary text-xs font-normal py-0.5">New</Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Secondary Navigation */}
        <div className="mt-8 mb-1 px-3">
          <p className="text-xs font-medium text-neutral-900 dark:text-neutral-200 uppercase tracking-wider">Support</p>
        </div>
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm group transition-colors
                  ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900 font-medium"
                      : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                  }
                `}
              >
                <item.icon
                  className={`w-4 h-4 mr-3 ${isActive ? "text-neutral-900" : "text-neutral-400 group-hover:text-neutral-200"}`}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

       {/* User Profile Section */}
       {user && (
        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border border-neutral-200">
              <AvatarImage src={user.profilePic || "/placeholder-user.svg"} alt={user.username} />
              <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{user.username}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-200 truncate">{user.email}</p>
            </div>
          </div>
          <Link href="/profile">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs justify-between border-neutral-200 font-normal"
            >
              View Profile
              <ChevronRight className="h-3 w-3 opacity-70" />
            </Button>
          </Link>
        </div>
      )}

      {/* Footer */}
      {!user && (
        <div className="p-4 border-t">
          <div className="text-center space-y-3">
            <p className="text-sm">Sign in to access all features</p>
            <Link href="/login">
              <Button className="w-full" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}

export default GigsSidebar
