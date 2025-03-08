"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { io, Socket } from "socket.io-client";

export default function ChatConversationPage() {
  // Extract dynamic parameter as id
  const { id } = useParams() as { id: string };
  const conversationId = id;
  const { token, user } = useAuthStore();
  const baseApiUrl = "http://localhost:8800/api";
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Use a ref for the socket instance so it persists across renders
  const socketRef = useRef<Socket | null>(null);

  // Debug log: print conversationId from the route
  useEffect(() => {
    console.log("Debug: conversationId from route:", conversationId);
  }, [conversationId]);

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
        console.log("Debug: Messages fetch status:", res.status);
        if (res.ok) {
          const msgs = await res.json();
          console.log("Debug: Fetched messages:", msgs);
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
    if (!newMessage.trim()) return;
    if (!socketRef.current) {
      console.error("Socket is not connected");
      return;
    }

    const messageData = {
      conversationId,
      message: {
        senderId: user?.id,
        content: newMessage,
        createdAt: new Date().toISOString(),
      },
    };

    console.log("Debug: Emitting newMessage event with data:", messageData);
    socketRef.current.emit("newMessage", messageData);
    
    // Add the message locally so the sender sees it immediately
    setMessages((prev) => [...prev, messageData.message]);
    setNewMessage("");
  };

  if (!token) return <div>Please log in to view this conversation.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Conversation</h1>
      
      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <>
          <div className="border rounded-lg p-4 h-[400px] overflow-y-auto mb-4 space-y-2">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-2 rounded-md max-w-xs ${
                      msg.senderId === user?.id ? "bg-blue-500 text-white" : "bg-gray-100"
                    }`}
                  >
                    <strong className="block text-sm">
                      {msg.senderId === user?.id ? "You" : "Other"}
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
