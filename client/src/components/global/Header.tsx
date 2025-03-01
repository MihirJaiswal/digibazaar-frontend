"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuthStore(); // ✅ Using Zustand store
  console.log("Auth store in Header:", useAuthStore.getState());
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      console.log("Attempting logout...");
      await logout(); // ✅ Ensure logout executes properly
      console.log("Logout successful");
      setIsOpen(false); // ✅ Close menu after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
          DigiBazar
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 text-gray-700 dark:text-gray-300 font-medium">
          {user && (
            <>
              <Link href="/gigs" className="hover:text-blue-600 dark:hover:text-blue-400 transition duration-200">
                Gigs
              </Link>
              <Link href="/orders" className="hover:text-blue-600 dark:hover:text-blue-400 transition duration-200">
                Orders
              </Link>
              <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition duration-200">
                Dashboard
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex gap-2">
          {user ? (
            <>
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
              <Button onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" disabled={pathname === "/auth/login"}>Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button disabled={pathname === "/auth/signup"}>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-900 dark:text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white dark:bg-gray-900 shadow-md"
          >
            <nav className="flex flex-col items-center py-4 gap-4">
              <Link
                href="/gigs"
                className="text-lg hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
                onClick={() => setIsOpen(false)}
              >
                Gigs
              </Link>
              {user && (
                <>
                  <Link
                    href="/orders"
                    className="text-lg hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-lg hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="text-lg hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
              <div className="flex flex-col w-full px-6 gap-2">
                {user ? (
                  <>
                    <Button onClick={handleLogout} variant="destructive" className="w-full">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full" disabled={pathname === "/auth/login"}>
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="w-full" disabled={pathname === "/auth/signup"}>
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}