"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  type: "user" | "bot"
  text: string
  id: string
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 500)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const handleSend = async () => {
    if (!userInput.trim()) return

    // Create a message with explicit type annotation
    const userMessage: Message = {
      type: "user",
      text: userInput,
      id: generateId(),
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Simulate network delay for smoother experience
      setTimeout(async () => {
        try {
          const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput }),
          })
          const data = await response.json()
          // Create a bot message with explicit type
          const botMessage: Message = {
            type: "bot",
            text: data.response,
            id: generateId(),
          }

          setMessages([...newMessages, botMessage])
        } catch (error) {
          // Handle errors by sending a default bot message
          const errorMessage: Message = {
            type: "bot",
            text: "Sorry, I couldn't process your request. Please try again later.",
            id: generateId(),
          }
          setMessages([...newMessages, errorMessage])
        }
        setLoading(false)
      }, 600) // Slight delay for smoother animation
    } catch (error) {
      setLoading(false)
    }

    setUserInput("")
    // Re-focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-b pb-4 mb-4"
      >
        <h3 className="font-semibold text-lg">Chat Assistant</h3>
        <p className="text-sm text-muted-foreground">How can I help you today?</p>
      </motion.div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="text-center text-muted-foreground text-sm py-12 px-4"
            >
              <div className="bg-muted/50 rounded-lg p-6 backdrop-blur-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-primary/60" />
                </div>
                <p className="font-medium mb-1">No messages yet</p>
                <p className="text-xs opacity-70">Send a message to start the conversation</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{
                opacity: 0,
                x: message.type === "user" ? 20 : -20,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className={cn(
                "flex items-start gap-2.5 group",
                message.type === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <Avatar
                  className={cn(
                    "h-8 w-8 border shadow-sm transition-all duration-300",
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <AvatarFallback>{message.type === "user" ? "U" : "AI"}</AvatarFallback>
                </Avatar>
              </motion.div>

              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-4 py-2.5 text-sm shadow-sm transition-all duration-300",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none hover:bg-muted/90",
                )}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2.5"
            >
              <Avatar className="h-8 w-8 border bg-muted shadow-sm">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="bg-muted text-foreground rounded-lg rounded-tl-none px-4 py-2.5 text-sm shadow-sm">
                <div className="flex space-x-1.5 items-center h-5">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0 }}
                    className="h-2 w-2 rounded-full bg-current opacity-70"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.2 }}
                    className="h-2 w-2 rounded-full bg-current opacity-70"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, delay: 0.4 }}
                    className="h-2 w-2 rounded-full bg-current opacity-70"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="border-t pt-4"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center space-x-2 relative"
        >
          <div
            className={cn(
              "flex-grow relative transition-all duration-300 rounded-md",
              isFocused ? "ring-2 ring-primary/20" : "",
            )}
          >
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type your message..."
              className={cn("pr-10 transition-all duration-300 border-muted/60", isFocused ? "border-primary/30" : "")}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={loading || !userInput.trim()}
            className={cn("shrink-0 transition-all duration-300", !userInput.trim() ? "opacity-70" : "opacity-100")}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

