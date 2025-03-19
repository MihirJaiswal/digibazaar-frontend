"use client"

import Image from "next/image"
import { useState } from "react"
import { ShoppingCart, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface NavbarProps {
  storeLogo: string
  storeName: string
  navBarColor?: string
  navBarTextColor?: string
  navBarHoverColor?: string
  borderColor?: string
  linkColor?: string
  linkHoverColor?: string
}

const Navbar: React.FC<NavbarProps> = ({
  storeLogo,
  storeName,
  navBarColor,
  navBarTextColor,
  navBarHoverColor,
  borderColor,
  linkColor,
  linkHoverColor,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  // Fallback default values
  const _navBarColor = navBarColor || "#020c1a"
  const _navBarTextColor = navBarTextColor || "#4b5563" // gray-700
  const _navBarHoverColor = navBarHoverColor || "#3b82f6" // primary blue
  const _borderColor = borderColor || "#e5e7eb" // gray-200
  const _linkColor = linkColor || _navBarTextColor
  const _linkHoverColor = linkHoverColor || _navBarHoverColor

  // List of navigation items
  const navItems = ["Home", "Shop", "Collections", "About", "Contact"]

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: _navBarColor,
        borderColor: _borderColor,
      }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {storeLogo ? (
            <Image
              src={storeLogo || "/placeholder.svg"}
              alt={storeName}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          ) : (
            <div
              className="h-10 w-10 rounded-md flex items-center justify-center font-bold"
              style={{ backgroundColor: _linkHoverColor, color: "#ffffff" }}
            >
              {storeName.charAt(0)}
            </div>
          )}
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: _navBarTextColor }}
          >
            {storeName}
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium transition-colors"
              style={{ color: _linkColor }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = _linkHoverColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = _linkColor)
              }
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            className="h-9 w-9 flex items-center justify-center rounded-full transition-colors"
            aria-label="Cart"
            style={{ color: _navBarTextColor }}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>

          <button
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-full transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ color: _navBarTextColor }}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
            style={{ borderTop: `1px solid ${_borderColor}` }}
          >
            <nav className="container mx-auto py-4 px-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="py-2 text-base font-medium transition-colors"
                  style={{ color: _linkColor }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = _linkHoverColor)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = _linkColor)
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
