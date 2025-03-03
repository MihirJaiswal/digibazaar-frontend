"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { Home, FileText, User, Users, Settings, Info, PlusCircle, Bell, Bookmark, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const Sidebar = () => {
  const { user } = useAuthStore()
  const pathname = usePathname()

  const navItems = [
    { href: "/community", label: "Home", icon: Home },
    { href: "/community/communities/posts", label: "All Posts", icon: FileText },
    { href: "/community/communities/explore", label: "Explore Communities", icon: Users },
    ...(user
      ? [
          { href: "/community/communities/user/posts", label: "Your Posts", icon: User },
          { href: "/community/communities/user/communities", label: "Your Communities", icon: Users },
          { href: "/community/communities/bookmarks", label: "Bookmarks", icon: Bookmark },
          { href: "/community/communities/notifications", label: "Notifications", icon: Bell, badge: 3 },
        ]
      : []),
  ]

  const secondaryNavItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/about", label: "About", icon: Info },
  ]

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 h-screen sticky top-0 flex flex-col overflow-y-auto">
      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10 border border-neutral-200">
              <AvatarImage src={user.profilePic || "/placeholder-user.svg"} alt={user.username} />
              <AvatarFallback>{user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium text-neutral-900 truncate">{user.username}</p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
          <Link href="/profile">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs justify-between border-neutral-200 text-neutral-700 font-normal"
            >
              View Profile
              <ChevronRight className="h-3 w-3 opacity-70" />
            </Button>
          </Link>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3">
        <div className="mb-1 px-3">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Navigation</p>
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
                  ${isActive ? "bg-primary/10 text-primary font-medium" : "text-neutral-700 hover:bg-neutral-100"}
                `}
              >
                <item.icon
                  className={`w-4 h-4 mr-3 ${isActive ? "text-primary" : "text-neutral-500 group-hover:text-neutral-700"}`}
                />
                <span>{item.label}</span>
                {item.badge && <Badge className="ml-auto bg-primary text-white text-xs">{item.badge}</Badge>}
              </Link>
            )
          })}
        </nav>

        {/* Create Post Button */}
        {user && (
          <div className="mt-6 px-3">
            <Link href="/community/communities/create-post">
              <Button className="w-full flex items-center gap-2 bg-primary hover:bg-primary/90">
                <PlusCircle className="h-4 w-4" />
                Create Post
              </Button>
            </Link>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="mt-8 mb-1 px-3">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Support</p>
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
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }
                `}
              >
                <item.icon
                  className={`w-4 h-4 mr-3 ${isActive ? "text-neutral-900" : "text-neutral-400 group-hover:text-neutral-700"}`}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      {!user && (
        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="text-center space-y-3">
            <p className="text-sm text-neutral-600">Sign in to join communities</p>
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

export default Sidebar

