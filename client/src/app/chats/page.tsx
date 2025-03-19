"use client"

import { useEffect, useState, type FormEvent, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/authStore"
import { io, type Socket } from "socket.io-client"
import { ArrowLeft, Send, Loader2, PlusCircle, MessageSquare, Users, User, Menu } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Header from "@/components/global/Header"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

interface Message {
  id?: string
  userId: string
  receiverId?: string
  content: string
  createdAt: string
  status?: "sending" | "sent" | "delivered" | "read"
}

interface Conversation {
  id: string
  lastMessage?: string
  lastMessageTime?: string
  participants?: { id: string; name: string }[]
  title?: string
  // Fallback fields if participants is missing:
  user1Id?: string
  user2Id?: string
  createdAt?: string
  updatedAt?: string
  readByUser1?: boolean
  readByUser2?: boolean
}

interface OtherUser {
  id: string
  username: string
  profilePic: string
}

export default function MergedChatsPage() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const baseApiUrl = `${process.env.NEXT_PUBLIC_API_URL}` 
  const [isMobile, setIsMobile] = useState(false)

  // ---------------------------
  // Left Sidebar: Conversation List
  // ---------------------------
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  // We'll store user details for each conversation's other user
  const [conversationUserDetails, setConversationUserDetails] = useState<Record<string, OtherUser>>({})

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/conversations`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setConversations(data)
        } else {
          console.error("Failed to fetch conversations. Status:", res.status)
        }
      } catch (err) {
        console.error("Error fetching conversations:", err)
      } finally {
        setLoadingConversations(false)
      }
    }

    fetchConversations()
  }, [token, baseApiUrl])

  // Helper function to compute the receiver's ID for a conversation
  const getReceiverId = (conv: Conversation) => {
    const fromParticipants = conv.participants?.find((p) => p.id !== user?.id)?.id
    if (fromParticipants) {
      return fromParticipants
    }
    if (conv.user1Id && conv.user2Id) {
      const receiverId = conv.user1Id === user?.id ? conv.user2Id : conv.user1Id
      return receiverId
    }
    return undefined
  }

  // For each conversation, prefetch the other user's details if not already fetched
  useEffect(() => {
    if (!conversations.length || !token || !user?.id) {
      return
    }
    conversations.forEach((conv) => {
      const receiverId = getReceiverId(conv)
      if (receiverId && !conversationUserDetails[receiverId]) {
        fetch(`${baseApiUrl}/users/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
          .then((res) => {
            if (res.ok) return res.json()
            throw new Error("Failed to fetch user details")
          })
          .then((data: OtherUser) => {
            setConversationUserDetails((prev) => ({ ...prev, [receiverId]: data }))
          })
          .catch((err) => {
            console.error("Error fetching user details for conversation list:", err)
          })
      }
    })
  }, [conversations, token, user?.id, baseApiUrl, conversationUserDetails])

  // ---------------------------
  // Right Side: Conversation Detail
  // ---------------------------
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  // Other user for the selected conversation (fetched separately)
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch conversation detail when a conversation is selected
  useEffect(() => {
    if (!selectedConversationId || !token) return
    const fetchConversation = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/conversations/${selectedConversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setConversation(data)
        } else {
          console.error("Failed to fetch conversation. Status:", res.status)
        }
      } catch (err) {
        console.error("Error fetching conversation:", err)
      }
    }
    fetchConversation()
  }, [selectedConversationId, token, baseApiUrl])

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (!selectedConversationId || !token) {
      setLoadingMessages(false)
      return
    }
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/messages/${selectedConversationId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })
        if (res.ok) {
          const msgs = await res.json()
          setMessages(msgs)
        } else {
          console.error("Failed to fetch messages. Status:", res.status)
        }
      } catch (err) {
        console.error("Error fetching messages:", err)
      } finally {
        setLoadingMessages(false)
      }
    }
    fetchMessages()
  }, [selectedConversationId, token, baseApiUrl])

  // Compute the receiver's ID for the selected conversation
  const receiverIdForDetail = conversation
    ? conversation.user1Id === user?.id
      ? conversation.user2Id
      : conversation.user1Id
    : undefined

  // Fetch the other user's details for the selected conversation
  useEffect(() => {
    if (!receiverIdForDetail || !token) return
    const fetchOtherUser = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/users/${receiverIdForDetail}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
        if (res.ok) {
          const userData = await res.json()
          setOtherUser(userData)
        } else {
          console.error("Failed to fetch other user details. Status:", res.status)
        }
      } catch (err) {
        console.error("Error fetching other user details:", err)
      }
    }
    fetchOtherUser()
  }, [receiverIdForDetail, token, baseApiUrl])

  // Setup socket connection for the selected conversation
  useEffect(() => {
    if (!selectedConversationId) return
    if (!socketRef.current) {
      socketRef.current = io(`${process.env.NEXT_PUBLIC_URL}`, { transports: ["websocket"] })
    }
    socketRef.current.emit("joinRoom", selectedConversationId)
    socketRef.current.on("messageReceived", (message) => {
      setMessages((prev) => [...prev, message])
    })
    return () => {
      socketRef.current?.off("messageReceived")
    }
  }, [selectedConversationId])

  // Close sidebar on mobile when a conversation is selected
  useEffect(() => {
    if (isMobile && selectedConversationId) {
      setSidebarOpen(false)
    }
  }, [selectedConversationId, isMobile])

  // Set sidebar open state based on mobile status
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socketRef.current) {
      return
    }
    setSending(true)
    const tempId = Date.now().toString()
    const messageData = {
      conversationId: selectedConversationId,
      message: {
        id: tempId,
        userId: user?.id as string,
        receiverId: receiverIdForDetail,
        content: newMessage,
        createdAt: new Date().toISOString(),
        status: "sending",
      } as Message,
    }
    setMessages((prev) => [...prev, messageData.message])
    setNewMessage("")
    socketRef.current.emit("newMessage", messageData)
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "sent" } : msg)))
      setSending(false)
    }, 500)
  }

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    return date.toDateString() === today.toDateString() ? format(date, "h:mm a") : format(date, "MMM d, h:mm a")
  }

  const getInitials = (text = "User") => text.charAt(0).toUpperCase()

  const handleConversationSelect = (convId: string) => {
    setSelectedConversationId(convId)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-b from-background to-muted/30">
        <div className="text-center space-y-6 max-w-md mx-auto p-8 rounded-lg border bg-card shadow-sm">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Sign in to access your chats</h2>
          <p className="text-muted-foreground">Please log in to view and participate in your conversations.</p>
          <Button onClick={() => router.push("/login")} className="mt-4 w-full">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Conversation list component
  const ConversationList = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {loadingConversations ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground opacity-70" />
            </div>
            <h3 className="font-medium text-lg">No conversations yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs">
              Start a new conversation to begin chatting with others
            </p>
            <Button
              onClick={() => {
                console.log("New chat clicked from empty state")
              }}
              variant="outline"
              className="gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Start a new chat
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conv) => {
              const receiverIdForConv = getReceiverId(conv)
              const otherUserData = receiverIdForConv ? conversationUserDetails[receiverIdForConv] : null
              const hasUnread =
                (user?.id === conv.user1Id && !conv.readByUser1) || (user?.id === conv.user2Id && !conv.readByUser2)

              return (
                <div
                  key={conv.id}
                  onClick={() => handleConversationSelect(conv.id)}
                  className={cn(
                    "cursor-pointer hover:bg-accent/50 transition-colors p-3 flex items-center gap-3",
                    selectedConversationId === conv.id && "bg-accent",
                    hasUnread && "bg-accent/20",
                  )}
                >
                  <Avatar className="h-12 w-12 border">
                    {otherUserData?.profilePic ? (
                      <AvatarImage src={otherUserData.profilePic} alt={otherUserData.username} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {otherUserData?.username
                        ? getInitials(otherUserData.username)
                        : (conv.title?.[0] || "C").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">
                        {otherUserData?.username || conv.title || `Chat ${conv.id.slice(0, 8)}`}
                      </h3>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {format(new Date(conv.lastMessageTime), "MMM d")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                      {hasUnread && <Badge variant="default" className="h-2 w-2 rounded-full p-0" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar with sheet */}
        {isMobile && (
          <div className="md:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-[5.2rem] left-4 z-10"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] sm:w-[350px]">
                <SheetTitle className="text-xl font-semibold text-center p-6 border-b">Messages</SheetTitle>
                <div className="h-full">
                  <ConversationList />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Desktop sidebar */}
        {!isMobile && (
          <div className="hidden md:block w-80 lg:w-96 border-r h-full">
            <ConversationList />
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-full">
          {selectedConversationId ? (
            <>
              {/* Chat header */}
              <div className="border-b p-4 flex items-center gap-3 bg-card">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedConversationId(null)
                      setSidebarOpen(true)
                    }}
                    className="ml-12"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <Avatar className="h-10 w-10 border">
                  {otherUser?.profilePic ? <AvatarImage src={otherUser.profilePic} alt={otherUser.username} /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {otherUser?.username ? getInitials(otherUser.username) : "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-medium">{otherUser?.username || "Chat"}</h2>
                  <p className="text-xs text-muted-foreground">
                    {otherUser?.id ? `User ID: ${otherUser.id.slice(0, 8)}...` : "Loading..."}
                  </p>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {loadingMessages ? (
                  <div className="space-y-4 py-8">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                        {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                        <div className={`max-w-[75%] space-y-1 ${i % 2 === 0 ? "items-end" : "items-start"}`}>
                          <Skeleton
                            className={`h-16 w-full rounded-lg ${i % 2 === 0 ? "rounded-br-none" : "rounded-bl-none"}`}
                          />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg">No messages yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      Send a message to start the conversation with {otherUser?.username || "this user"}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isCurrentUser = String(msg.userId) === String(user?.id)
                      const showAvatar = index === 0 || messages[index - 1]?.userId !== msg.userId

                      return (
                        <div key={msg.id || index} className="w-full">
                          <div
                            className={cn(
                              "flex gap-2 w-full",
                              isCurrentUser ? "justify-end" : "justify-start",
                              index > 0 && messages[index - 1]?.userId === msg.userId ? "mt-1" : "mt-4",
                            )}
                          >
                            {!isCurrentUser && showAvatar ? (
                              <Avatar className="h-8 w-8 mt-1">
                                {otherUser?.profilePic ? (
                                  <AvatarImage src={otherUser.profilePic} alt={otherUser.username} />
                                ) : null}
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(otherUser?.username || "U")}
                                </AvatarFallback>
                              </Avatar>
                            ) : !isCurrentUser ? (
                              <div className="w-8" />
                            ) : null}

                            <div
                              className={cn("max-w-[75%] flex flex-col", isCurrentUser ? "items-end" : "items-start")}
                            >
                              <div
                                className={cn(
                                  "px-3 py-2 rounded-lg",
                                  isCurrentUser
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-card border rounded-bl-none",
                                )}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <span>{formatMessageDate(msg.createdAt)}</span>
                                {isCurrentUser && msg.status && (
                                  <span className="ml-1">
                                    {msg.status === "sending" && "Sending..."}
                                    {msg.status === "sent" && "Sent"}
                                    {msg.status === "delivered" && "Delivered"}
                                    {msg.status === "read" && "Read"}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isCurrentUser && showAvatar ? (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(user?.username)}
                                </AvatarFallback>
                              </Avatar>
                            ) : isCurrentUser ? (
                              <div className="w-8" />
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message input */}
              <div className="border-t p-4 bg-card">
                <form onSubmit={sendMessage} className="flex items-center gap-2 max-w-5xl mx-auto">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim() || sending}
                    className={cn("transition-all", !newMessage.trim() && "opacity-50")}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 p-6 bg-muted/20">
              <div className="text-center space-y-4 max-w-md bg-card p-8 rounded-lg border shadow-sm">
                <div className="bg-primary/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Select a conversation</h2>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar or start a new chat to begin messaging.
                </p>
                {isMobile && (
                  <Button onClick={() => setSidebarOpen(true)} variant="outline" className="mt-2">
                    <Menu className="h-4 w-4 mr-2" />
                    Open conversations
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

