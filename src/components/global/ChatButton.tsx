"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ChatBox from "./ChatBox"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => {
    if (isToggling) return
    setIsToggling(true)
    setIsOpen((prev) => !prev)
    setTimeout(() => setIsToggling(false), 300)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (chatBoxRef.current && !chatBoxRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    // Wrapping the entire container in a draggable motion.div.
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="mb-4"
          >
            <Card
              ref={chatBoxRef}
              className="w-80 sm:w-96 h-[500px] shadow-xl border-primary/10 overflow-hidden rounded-2xl backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="h-full p-4"
              >
                <ChatBox />
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative z-50"
      >
        <Button
          onClick={toggleChat}
          size="icon"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            isOpen ? "bg-purple-600 hover:bg-purple-600/90" : "bg-primary hover:bg-primary/90"
          )}
          aria-label={isOpen ? "Close Chat" : "Open Chat"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </motion.div>
          </AnimatePresence>
        </Button>
      </motion.div>

      {!isOpen && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: -10 }}
              animate={{ opacity: 1, y: 0, x: -10 }}
              exit={{ opacity: 0, y: 10, x: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 bg-background border shadow-md rounded-lg px-3 py-2 text-sm font-medium"
            >
              Chat with us
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}
