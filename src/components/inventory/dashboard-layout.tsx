"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { Box, ChevronRight, ClipboardList, Home, LogOut, Menu, Package, Settings, Truck, User, Warehouse, X } from "lucide-react"
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

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuthStore()
  const { user } = useAuthStore()
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

  const navigation = [
    { name: "Dashboard", href: "/inventory", icon: Home },
    { name: "Products", href: "/inventory/products", icon: Package },
    { name: "Orders", href: "/inventory/orders", icon: ClipboardList },
    { name: "Warehouses", href: "/inventory/warehouse", icon: Warehouse },
    { name: "Stock", href: "/inventory/stock", icon: Box },
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
      
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-black">
        {/* Sidebar */}
        <div 
          className={`
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            ${isCollapsed ? 'md:w-20' : 'md:w-64'}
            md:translate-x-0 fixed md:relative z-40 md:flex md:flex-shrink-0
            transition-all duration-300 ease-in-out h-full
          `}
        >
          <div className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex flex-col flex-grow overflow-y-auto bg-white dark:bg-black border-r shadow-lg">
              {/* Logo area */}
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} flex-shrink-0 px-4 h-16 border-b border-gray-200 dark:border-zinc-700`}>
                {!isCollapsed && (
                  <>
                    <div className="flex items-center">
                      <Truck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">WMS</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsCollapsed(true)}
                      className="hidden md:flex"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {isCollapsed && (
                  <div className="flex items-center justify-center">
                    <Truck 
                      className="h-6 w-6 text-indigo-600 dark:text-indigo-400" 
                      onClick={() => setIsCollapsed(false)}
                    />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex flex-col flex-grow pt-5 pb-4">
                <nav className="flex-1 px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        pathname === item.href
                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700/50 border-l-4 border-transparent",
                        "group flex items-center px-3 py-3 text-sm font-medium transition-colors duration-150"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} aria-hidden="true" />
                      {!isCollapsed && item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* User profile */}
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-zinc-700 p-4 bg-white dark:bg-gradient-to-t from-black via-zinc-950 to-zinc-900">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} w-full text-sm text-left text-gray-700 dark:text-gray-300`}>
                    <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-gray-200 dark:ring-zinc-700">
                      <AvatarImage src="/placeholder-user.jpg" alt={user?.username || "User"} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
                        {user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div className="ml-2 flex flex-col">
                        <span className="font-medium">{user?.username || "User"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Inventory Manager</span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile">
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

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
         
          
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 dark:bg-zinc-900">
            <div className="max-w-7xl mx-auto  md:px-8 md:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}