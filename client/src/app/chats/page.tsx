"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { PlusCircle, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  lastMessage?: string;
  lastMessageTime?: string;
  participants?: { id: string; name: string }[];
  title?: string;
}

export default function ChatsPage() {
  const { token, user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const baseApiUrl = "http://localhost:8800/api";

  useEffect(() => {
    if (!token) return;
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/conversations`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        } else {
          console.error("Failed to fetch conversations");
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token]);

  const handleNewChat = () => {
    // This would typically create a new conversation and redirect
    // For now, we'll just log it
    console.log("Creating new chat");
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6">
        <div className="text-center space-y-4 max-w-md">
          <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Sign in to access your chats</h2>
          <p className="text-muted-foreground">
            Please log in to view and manage your conversations.
          </p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-semibold">Conversations</h1>
          <Button onClick={handleNewChat} size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium text-lg">No conversations yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Start a new conversation to begin chatting
              </p>
              <Button onClick={handleNewChat} variant="outline" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Start a new chat
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="cursor-pointer hover:bg-accent transition-colors p-3"
                  onClick={() => router.push(`/chats/${conv.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {(conv.title?.[0] || "C").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">
                          {conv.title || `Chat ${conv.id.slice(0, 8)}`}
                        </h3>
                        {conv.lastMessageTime && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content area - only visible on larger screens */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1 p-6 bg-accent/5">
        <div className="text-center space-y-4 max-w-md">
          <MessageSquare className="h-16 w-16 text-primary/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Select a conversation</h2>
          <p className="text-muted-foreground">
            Choose a conversation from the sidebar or start a new chat to begin messaging.
          </p>
        </div>
      </div>
    </div>
  );
}
