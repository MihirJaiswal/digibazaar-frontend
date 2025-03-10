"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { io, Socket } from "socket.io-client";
import { ArrowLeft, Send, Loader2, User, Users } from 'lucide-react';
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Header from "@/components/global/Header";

interface Message {
  id?: string;
  senderId: string;
  content: string;
  createdAt: string;
  status?: "sending" | "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  title?: string;
  participants?: { id: string; name: string }[];
}

export default function ChatConversationPage() {
  const { id } = useParams() as { id: string };
  const conversationId = id;
  const { token, user } = useAuthStore();
  const baseApiUrl = "http://localhost:8800/api";
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use a ref for the socket instance so it persists across renders
  const socketRef = useRef<Socket | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup socket connection and join room using a ref
  useEffect(() => {
    if (!conversationId) return;
    
    // Initialize socket if not already
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:8800", { transports: ["websocket"] });
    }
    
    // Join the conversation room (using "joinRoom" to match the server)
    socketRef.current.emit("joinRoom", conversationId);
    console.log(`✅ Joined room: ${conversationId}`);

    // Listen for incoming messages
    socketRef.current.on("messageReceived", (message) => {
      console.log("📩 New message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.off("messageReceived");
      // Optionally disconnect: socketRef.current?.disconnect();
    };
  }, [conversationId]);

  // Fetch conversation details
  useEffect(() => {
    if (!token || !conversationId) return;
    
    const fetchConversation = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/conversations/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          setConversation(data);
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
      }
    };
    
    fetchConversation();
  }, [token, conversationId]);

  // Fetch initial messages from REST API
  useEffect(() => {
    if (!token || !conversationId) {
      setLoading(false);
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/messages/${conversationId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (res.ok) {
          const msgs = await res.json();
          setMessages(msgs);
        } else {
          console.error("❌ Failed to fetch messages, status:", res.status);
        }
      } catch (err) {
        console.error("⚠️ Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [token, conversationId]);

  // Send message via WebSocket and update local state
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;
    
    setSending(true);
    
    const tempId = Date.now().toString();
    const messageData = {
      conversationId,
      message: {
        id: tempId,
        senderId: user?.id,
        content: newMessage,
        createdAt: new Date().toISOString(),
        status: "sending",
      } as Message,
    };

    // Add message to local state immediately with "sending" status
    setMessages((prev) => [...prev, messageData.message]);
    setNewMessage("");

    // Emit the message to the server
    socketRef.current.emit("newMessage", messageData);
    
    // Simulate message being sent after a short delay
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, status: "sent" } 
            : msg
        )
      );
      setSending(false);
    }, 500);
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, "h:mm a");
    }
    
    return format(date, "MMM d, h:mm a");
  };

  const getInitials = (name: string = "User") => {
    return name.charAt(0).toUpperCase();
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6">
        <div className="text-center space-y-4 max-w-md">
          <User className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Sign in to access this chat</h2>
          <p className="text-muted-foreground">
            Please log in to view and participate in this conversation.
          </p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Chat header */}
      <div className="border-b p-3 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => router.push("/chats")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {conversation?.title 
            ? getInitials(conversation.title) 
            : conversation?.participants?.length ? <Users className="h-5 w-5" /> : "C"}
        </div>
        
        <div className="flex-1">
          <h2 className="font-medium">
            {conversation?.title || `Chat ${conversationId.slice(0, 8)}`}
          </h2>
          <p className="text-xs text-muted-foreground">
            {conversation?.participants?.length 
              ? `${conversation.participants.length} participants` 
              : "Loading conversation details..."}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="font-medium text-lg">No messages yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === user?.id;
              const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
              const showTimestamp = index === messages.length - 1 || 
                messages[index + 1]?.senderId !== msg.senderId;
              
              return (
                <div key={msg.id || index} className={cn(
                  "flex gap-2",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}>
                  {!isCurrentUser && showAvatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "max-w-[75%] flex flex-col",
                    isCurrentUser ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-3 py-2 rounded-lg",
                      isCurrentUser 
                        ? "bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-accent rounded-bl-none"
                    )}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    
                    {showTimestamp && (
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
                    )}
                  </div>
                  
                  {isCurrentUser && showAvatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(user?.username)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="border-t p-3">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
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
            className={cn(
              "transition-all",
              !newMessage.trim() && "opacity-50"
            )}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
    </>
  );
}
