"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

export default function ChatConversationPage() {
  // Destructure `id` from useParams, then assign it to conversationId.
  const { id } = useParams() as { id: string };
  const conversationId = id; // Now conversationId is defined.
  const { token, user } = useAuthStore();
  const baseApiUrl = "http://localhost:8800/api";
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Debug log to verify conversationId
  useEffect(() => {
    console.log("Debug: conversationId from route:", conversationId);
  }, [conversationId]);

  // Fetch the conversation details
  useEffect(() => {
    if (!token || !conversationId) {
      console.log("Debug: No token or conversationId found, setting loading to false");
      setLoading(false);
      return;
    }
    const fetchConversation = async () => {
      try {
        console.log("Debug: Fetching conversation from:", `${baseApiUrl}/conversations/${conversationId}`);
        const res = await fetch(`${baseApiUrl}/conversations/${conversationId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        console.log("Debug: Conversation fetch status:", res.status);
        if (res.ok) {
          const conv = await res.json();
          console.log("Debug: Fetched conversation:", conv);
          setConversation(conv);
        } else {
          console.error("Failed to fetch conversation, status:", res.status);
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [token, conversationId]);

  // Fetch messages for the conversation
  useEffect(() => {
    if (!token || !conversationId) {
      console.log("Debug: Not fetching messages - token or conversationId missing");
      return;
    }
    const fetchMessages = async () => {
      try {
        console.log("Debug: Fetching messages from:", `${baseApiUrl}/messages/${conversationId}`);
        const res = await fetch(`${baseApiUrl}/messages/${conversationId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        console.log("Debug: Messages fetch status:", res.status);
        if (res.ok) {
          const msgs = await res.json();
          console.log("Debug: Fetched messages:", msgs);
          setMessages(msgs);
        } else {
          console.error("Failed to fetch messages, status:", res.status);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [token, conversationId]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    console.log("Debug: Sending message with conversationId:", conversationId);
    console.log("Debug: Message content:", newMessage);
    try {
      const res = await fetch(`${baseApiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          conversationId,
          content: newMessage,
        }),
      });
      console.log("Debug: Send message status:", res.status);
      if (res.ok) {
        const msg = await res.json();
        console.log("Debug: Sent message response:", msg);
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      } else {
        console.error("Failed to send message, status:", res.status);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!token) return <div>Please log in to view this conversation.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Conversation</h1>
      {loading ? (
        <p>Loading conversation...</p>
      ) : (
        <>
          <Card className="mb-4">
            <CardContent>
              <p className="text-lg font-medium">Chat ID: {conversation?.id}</p>
              <p className="text-sm text-muted-foreground">
                Last message: {conversation?.lastMessage || "No messages yet"}
              </p>
            </CardContent>
          </Card>
          <div className="border rounded-lg p-4 h-[400px] overflow-y-auto mb-4 space-y-2">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-2">
                  <div className="bg-gray-100 p-2 rounded-md">
                    <strong className="block text-sm">
                      {msg.userId === user?.id ? "You" : "Other"}
                    </strong>
                    <span className="text-base">{msg.content}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="px-4">
              Send
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
