"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

export default function ChatsPage() {
  const { token, user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
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

  if (!token) {
    return <div>Please log in to see your conversations.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Conversations</h1>
      {loading ? (
        <p>Loading conversations...</p>
      ) : conversations.length === 0 ? (
        <p>No conversations found. Start a new conversation!</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/chats/${conv.id}`)}
            >
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium">Chat ID: {conv.id}</p>
                  <Button variant="outline" size="sm">
                    View Chat
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last message: {conv.lastMessage || "No messages yet"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
