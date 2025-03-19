"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Menu, X, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DocsSidebar = ({ sections, activeSection, setActiveSection }) => {
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

  // Mobile menu button
  const MobileMenuButton = () => (
    <button 
      className="md:hidden fixed top-3 left-3 z-50 bg-white dark:bg-black p-4 rounded-full"
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
          md:translate-x-0 fixed top-0 left-0 z-40 md:flex md:flex-shrink-0
          transition-all duration-300 ease-in-out h-full mt-16 
        `}
      >
        <div className={`flex flex-col h-full ${isCollapsed ? 'w-20' : 'w-64'}`}>
          <div className="flex flex-col flex-grow overflow-y-auto bg-white dark:bg-black border-r border-gray-200 dark:border-gray-700 shadow-lg">
            {/* Logo area */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-700`}>
              {!isCollapsed && (
                <>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white">About DigiBazaar</span>
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
                  <BookOpen 
                    className="h-5 w-5 text-gray-600 dark:text-gray-400 cursor-pointer" 
                    onClick={() => setIsCollapsed(false)}
                  />
                </div>
              )}
            </div>

            {/* Sections */}
            <div className="flex-1 p-4">
              {!isCollapsed ? (
                <div className="space-y-6">
                  {sections.map((section, index) => (
                    <div key={index} className="space-y-2">
                      <h3 
                        className={cn(
                          "text-sm font-medium cursor-pointer",
                          activeSection === index 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-gray-700 dark:text-gray-300"
                        )}
                        onClick={() => setActiveSection(index)}
                      >
                        {section.title}
                      </h3>
                      
                      {activeSection === index && (
                        <ul className="pl-2 space-y-1">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <a 
                                href={item.href} 
                                className={cn(
                                  "block text-sm py-1 px-2 rounded border-l-2",
                                  pathname === item.href
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {item.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-6">
                  {sections.map((section, index) => (
                    <div 
                      key={index} 
                      className="cursor-pointer"
                      onClick={() => {
                        setIsCollapsed(false);
                        setActiveSection(index);
                      }}
                      title={section.title}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center",
                        activeSection === index 
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      )}>
                        <span className="text-xs font-bold">{section.title.charAt(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
    </>
  )
}

export default DocsSidebar