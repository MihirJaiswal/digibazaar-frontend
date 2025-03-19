"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { 
  Home, FileText, User, Users, Settings, Info, 
  PlusCircle, ChevronRight, ChevronLeft, Menu, X, LogOut 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

const CommunitySidebar = () => {
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
    { name: "Home", href: "/community", icon: Home },
    { name: "All Posts", href: "/community/communities/posts", icon: FileText },
    { name: "Explore Communities", href: "/community/communities/explore", icon: Users },
    ...(user
      ? [
          { name: "Your Posts", href: "/community/communities/user/posts", icon: User },
          { name: "Your Communities", href: "/community/communities/user/communities", icon: Users },
        ]
      : []),
  ]

  const secondaryNavItems = [
    { name: "About", href: "/about", icon: Info },
  ]

  // Mobile menu button
  const MobileMenuButton = () => (
    <button 
      className="md:hidden fixed top-2 left-2 z-50 bg-white dark:bg-black p-4 "
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
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Community</span>
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
                  <Users 
                    className="h-6 w-6 text-purple-600 dark:text-purple-400 cursor-pointer" 
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
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-l-4 border-purple-500"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700/50 border-l-4 border-transparent",
                        "group flex items-center px-3 py-3 text-sm font-medium transition-colors duration-150"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} aria-hidden="true" />
                      {!isCollapsed && item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Create Community Button */}
              {user && !isCollapsed && (
                <div className="mt-6 px-3">
                  <Link href="/community/communities/create" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                      <PlusCircle className="h-4 w-4" />
                      Create Community
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Create Community Icon when collapsed */}
              {user && isCollapsed && (
                <div className="mt-6 px-3">
                  <Link href="/community/communities/create" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="icon" className="w-full aspect-square flex items-center justify-center bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Secondary Navigation */}
              {!isCollapsed && (
                <>
                  <div className="mt-8 mb-2 px-3">
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
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-zinc-700 p-4 bg-white dark:bg-gradient-to-t from-black via-zinc-950 to-zinc-900">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} w-full text-sm text-left text-gray-700 dark:text-gray-300`}>
                    <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-gray-200 dark:ring-zinc-700">
                      <AvatarImage src={user.profilePic || "/placeholder-user.svg"} alt={user.username} />
                      <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200">
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
                    <Link href='/profile' >
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to join communities</p>
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

export default CommunitySidebar