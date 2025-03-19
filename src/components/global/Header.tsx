"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Menu, MessageSquare, User, LogOut, ChevronDown, ShoppingCart, LayoutDashboard, Store } from "lucide-react"
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import Image from "next/image"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
        isScrolled ? "bg-background/90 backdrop-blur-lg shadow-sm dark:bg-black/90" : "bg-white dark:bg-black",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Left Section: Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-300 dark:to-cyan-400"
          >
            <div className="w-full h-8 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="logo"
                width={32}
                height={32}
                loading="lazy"
                quality={100}
                className="object-contain"
              />
            </div>
            <span className="text-xl hidden md:inline uppercase -ml-1 tracking-wide">igiBazaar</span>
          </Link>
        </div>

        {/* Centered Navigation (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors hover:text-primary dark:hover:text-blue-400",
                pathname === "/"
                  ? "text-blue-500 dark:text-blue-400 font-medium"
                  : "text-foreground dark:text-gray-300",
              )}
            >
              Home
            </Button>
          </Link>

            
          <Link href="/about">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors hover:text-primary dark:hover:text-blue-400",
                pathname === "/about"
                  ? "text-blue-500 dark:text-blue-400 font-medium"
                  : "text-foreground dark:text-gray-300",
              )}
            >
              About
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "transition-colors hover:text-primary dark:hover:text-blue-400 gap-1",
                  ["/store", "/inventory", "/wholesale"].includes(pathname)
                    ? "text-blue-500 dark:text-blue-400 font-medium"
                    : "text-foreground dark:text-gray-300",
                )}
              >
                Shop <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem onClick={() => router.push("/store")}>
                <Store className="mr-2 h-4 w-4" />
                Store
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/inventory")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Inventory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/gigs")}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Wholesale
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        

          <Link href="/community">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors hover:text-primary dark:hover:text-blue-400",
                pathname === "/community"
                  ? "text-blue-500 dark:text-blue-400 font-medium"
                  : "text-foreground dark:text-gray-300",
              )}
            >
              Community
            </Button>
          </Link>

        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="rounded-full p-2">
                <ShoppingCart className="h-5 w-5 text-foreground dark:text-gray-300" />
              </Button>
            </Link>
          )}

          {/* Messages (Only for logged-in users) */}
          {user && (
            <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={() => router.push("/chats")}>
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
                      className="object-cover"
                    />
                    <AvatarFallback className="dark:bg-gray-700 dark:text-white">
                      {user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="dark:text-gray-300">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-gray-600" />
                <DropdownMenuItem
                  className="dark:text-gray-300 hover:dark:bg-zinc-700"
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="dark:text-gray-300 hover:dark:bg-zinc-700"
                  onClick={() => router.push("/inventory")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="dark:text-gray-300 hover:dark:bg-zinc-700"
                  onClick={() => router.push("/store")}
                >
                  <Store className="mr-2 h-4 w-4" />
                  Store
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-600" />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive dark:text-red-400 hover:dark:bg-zinc-700"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={() => router.push("/auth/login")}>
              Sign In
            </Button>
          )}

          {/* Dark Mode Toggle */}
          <ModeToggle />

          {/* Mobile Menu (Visible on smaller screens) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden rounded-full p-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-2 mt-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      pathname === "/" ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "",
                    )}
                  >
                    Home
                  </Button>
                </Link>

                <Collapsible className="w-full">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between",
                        ["/store", "/inventory", "/gigs"].includes(pathname)
                          ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "",
                      )}
                    >
                      Shop
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-2 mt-2">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === "/store" ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "",
                      )}
                      onClick={() => router.push("/store")}
                    >
                      <Store className="mr-2 h-4 w-4" />
                      Store
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === "/inventory"
                          ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "",
                      )}
                      onClick={() => router.push("/inventory")}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Inventory
                    </Button>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === "/gigs" ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "",
                      )}
                      onClick={() => router.push("/gigs")}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Wholesale
                    </Button>
                  </CollapsibleContent>
                </Collapsible>

                <Link href="/community">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      pathname === "/community"
                        ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "",
                    )}
                  >
                    Community
                  </Button>
                </Link>

                <Link href="/about">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      pathname === "/about" ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "",
                    )}
                  >
                    About
                  </Button>
                </Link>
              </nav>

              {/* Mobile User Menu (if logged in) */}
              {user && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback className="dark:bg-gray-700 dark:text-white">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium dark:text-gray-200">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/inventory")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/store")}>
                      <Store className="mr-2 h-4 w-4" />
                      Store
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

