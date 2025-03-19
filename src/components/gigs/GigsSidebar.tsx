"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { 
  Home, PlusCircle, Settings, Info, ShoppingBag, 
  ChevronRight, ChevronLeft, PieChart, Menu, X, 
  MessageSquare, Store, User, LogOut 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const GigsSidebar = () => {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const navItems = [
    { name: "Home", href: "/gigs", icon: Home },
    { name: "Marketplace", href: "/gigs/gig", icon: Store },
    ...(user
      ? [
          { name: "Dashboard", href: "/gigs/dashboard", icon: PieChart },
          { name: "Your Orders", href: "/gigs/orders", icon: ShoppingBag },
          { name: "Your Inquiries", href: "/gigs/inquiries", icon: MessageSquare },
          { name: "List a Product", href: "/gigs/create-gig", icon: PlusCircle, highlight: true },
        ]
      : []),
  ]

  const secondaryNavItems = [
    { name: "About", href: "/about", icon: Info },
  ]

  // Mobile menu button
  const MobileMenuButton = () => (
    <button 
      className="md:hidden fixed top-2 left-2 z-50 bg-white dark:bg-black p-4"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
    >
      {isMobileMenuOpen ? (
        <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  )

  return (
    <>
      <MobileMenuButton />
      
      <div 
        className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          md:translate-x-0 fixed md:relative z-40 md:flex md:flex-shrink-0
          transition-all duration-300 ease-in-out min-h-screen
        `}
      >
        <div className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-64'}`}>
          <div className="flex flex-col flex-grow overflow-y-auto bg-white dark:bg-black border-r shadow-lg">
            {/* Logo area */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} flex-shrink-0 px-4 h-16 border-b border-gray-200 dark:border-zinc-700`}>
              {!isCollapsed && (
                <>
                  <div className="flex items-center">
                    <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Gigs</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsCollapsed(true)}
                    className="hidden md:flex"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </>
              )}
              {isCollapsed && (
                <div className="flex items-center justify-center">
                  <Store 
                    className="h-6 w-6 text-blue-600 dark:text-blue-400 cursor-pointer" 
                    onClick={() => setIsCollapsed(false)}
                  />
                </div>
              )}
            </div>

            {/* Main Navigation */}
            <div className="flex flex-col flex-grow pt-5 pb-4">
              <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500"
                          : item.highlight
                          ? "text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-700/50 border-l-4 border-transparent"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700/50 border-l-4 border-transparent",
                        "group flex items-center px-3 py-3 text-sm font-medium transition-colors duration-150"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} aria-hidden="true" />
                      {!isCollapsed && (
                        <div className="flex justify-between items-center w-full">
                          <span>{item.name}</span>
                          {!isActive && item.highlight && (
                            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs py-0.5">New</Badge>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Secondary Navigation */}
              {!isCollapsed && (
                <>
                  <div className="mt-6 mb-2 px-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Support</p>
                  </div>
                  <nav className="px-2 space-y-1">
                    {secondaryNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            isActive
                              ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-l-4 border-gray-500"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700/50 border-l-4 border-transparent",
                            "group flex items-center px-3 py-2 text-sm font-medium transition-colors duration-150"
                          )}
                        >
                          <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </>
              )}
            </div>
          </div>

          {/* User profile */}
          {user ? (
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-zinc-700 p-4 bg-white dark:bg-black">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} w-full text-sm text-left text-gray-700 dark:text-gray-300`}>
                    <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-gray-200 dark:ring-zinc-700">
                      <AvatarImage src={user.profilePic || "/placeholder-user.svg"} alt={user.username} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="ml-2 flex flex-col overflow-hidden">
                        <span className="font-medium truncate">{user.username}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href='/profile'>
                    <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-zinc-700 p-4 bg-white dark:bg-black">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to access all features</p>
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}

export default GigsSidebar