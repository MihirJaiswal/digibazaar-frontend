"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import {
  Menu,
  MessageSquare,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShoppingCart,
  LayoutDashboard,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { usePathname, useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./ModeToggle"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import Image from "next/image"

export default function Header() {
  const { user, logout } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [_isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Update state on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all border-b duration-300 md:px-0 px-3",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-sm dark:bg-black/80"
          : "bg-white dark:bg-black"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Left Section: Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-300 dark:to-cyan-400"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
              src="/logo.png"
              alt="logo"
              width={32}
              height={32}
              />
            </div>
            <span className="text-xl hidden md:inline uppercase">igiBazaar</span>
          </Link>
        </div>

        {/* Centered Navigation (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { name: "Home", path: "/" },
            { name: "Store", path: "/store" },
            { name: "Gigs", path: "/gigs" },
            { name: "Community", path: "/community" },
            { name: "Inventory", path: "/inventory" },
          ].map((route) => (
            <Link key={route.path} href={route.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "transition-colors hover:text-primary dark:hover:text-blue-400",
                  pathname === route.path
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-foreground dark:text-gray-300"
                )}
              >
                {route.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Cart (Always Visible) */}
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="rounded-full p-2">
              <ShoppingCart className="h-5 w-5 text-foreground dark:text-gray-300" />
            </Button>
          </Link>

          {/* Messages (Only for logged-in users) */}
          {user && (
            <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={() => router.push("/chats")} >
              <MessageSquare className="h-5 w-5 text-foreground dark:text-gray-300" />
            </Button>
          )}

          {/* Desktop User Dropdown (Only when logged in) */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex gap-2 font-normal text-foreground dark:text-gray-300"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={user.profilePic || "/placeholder.svg"}
                      alt={user.username}
                    />
                    <AvatarFallback className="dark:bg-gray-700 dark:text-white">
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56"
              >
                <DropdownMenuLabel className="dark:text-gray-300">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-gray-600" />
                <DropdownMenuItem className="dark:text-gray-300 hover:dark:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="dark:text-gray-300 hover:dark:bg-gray-700">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem className="dark:text-gray-300 hover:dark:bg-gray-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-600" />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive dark:text-red-400 hover:dark:bg-gray-700"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) :  (
            
              <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={() => router.push("/auth/login")}>
                Sign In
              </Button>
            )
            }

          {/* Dark Mode Toggle */}
          <ModeToggle />

          {/* Mobile Menu (Visible on smaller screens) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden rounded-full p-2"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-2 mt-4">
                {[
                  { name: "Home", path: "/" },
                  { name: "Store", path: "/store" },
                  { name: "Gigs", path: "/gigs" },
                  { name: "Community", path: "/community" },
                  { name: "Inventory", path: "/inventory" },
                ].map((route) => (
                  <Link key={route.path} href={route.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === route.path
                          ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      )}
                    >
                      {route.name}
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Mobile User Menu (if logged in) */}
              {user && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.profilePic || "/placeholder.svg"}
                        alt={user.username}
                      />
                      <AvatarFallback className="dark:bg-gray-700 dark:text-white">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium dark:text-gray-200">
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        User
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
