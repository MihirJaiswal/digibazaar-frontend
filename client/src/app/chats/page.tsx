"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft,
  Send,
  Loader2,
  PlusCircle,
  MessageSquare,
  Users,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Header from "@/components/global/Header";
import Image from "next/image";

interface Message {
  id?: string;
  userId: string;
  receiverId?: string;
  content: string;
  createdAt: string;
  status?: "sending" | "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  lastMessage?: string;
  lastMessageTime?: string;
  participants?: { id: string; name: string }[];
  title?: string;
  // Fallback fields if participants is missing:
  user1Id?: string;
  user2Id?: string;
  createdAt?: string;
  updatedAt?: string;
  readByUser1?: boolean;
  readByUser2?: boolean;
}

interface OtherUser {
  id: string;
  username: string;
  profilePic: string;
}

export default function MergedChatsPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const baseApiUrl = "http://localhost:8800/api";

  // ---------------------------
  // Left Sidebar: Conversation List
  // ---------------------------
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  // We'll store user details for each conversation's other user
  const [conversationUserDetails, setConversationUserDetails] = useState<
    Record<string, OtherUser>
  >({});

  useEffect(() => {
    console.log("[DEBUG] useEffect: Fetching conversations triggered");
    if (!token) {
      console.log("[DEBUG] No token found. Skipping conversations fetch.");
      return;
    }
    const fetchConversations = async () => {
      console.log("[DEBUG] fetchConversations: starting fetch");
      try {
        const res = await fetch(`${baseApiUrl}/conversations`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        console.log("[DEBUG] fetchConversations: response", res);
        if (res.ok) {
          const data = await res.json();
          console.log("[DEBUG] Fetched conversations:", data);
          setConversations(data);
        } else {
          console.error("[DEBUG] Failed to fetch conversations. Status:", res.status);
        }
      } catch (err) {
        console.error("[DEBUG] Error fetching conversations:", err);
      } finally {
        setLoadingConversations(false);
        console.log("[DEBUG] fetchConversations: finished");
      }
    };

    fetchConversations();
  }, [token]);

  // Helper function to compute the receiver's ID for a conversation
  const getReceiverId = (conv: Conversation) => {
    const fromParticipants = conv.participants?.find((p) => p.id !== user?.id)?.id;
    if (fromParticipants) {
      console.log("[DEBUG] getReceiverId: Found participant from conv:", fromParticipants);
      return fromParticipants;
    }
    if (conv.user1Id && conv.user2Id) {
      const receiverId = conv.user1Id === user?.id ? conv.user2Id : conv.user1Id;
      console.log("[DEBUG] getReceiverId: Using fallback fields, receiverId:", receiverId);
      return receiverId;
    }
    console.log("[DEBUG] getReceiverId: Unable to determine receiverId");
    return undefined;
  };

  // For each conversation, prefetch the other user's details if not already fetched
  useEffect(() => {
    console.log("[DEBUG] useEffect: Prefetching other user's details for conversations");
    if (!conversations.length || !token || !user?.id) {
      console.log("[DEBUG] Skipping prefetch: conversations empty or missing token/user id");
      return;
    }
    conversations.forEach((conv) => {
      const receiverId = getReceiverId(conv);
      if (receiverId && !conversationUserDetails[receiverId]) {
        console.log("[DEBUG] Fetching user details for receiverId:", receiverId);
        fetch(`${baseApiUrl}/users/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
          .then((res) => {
            console.log("[DEBUG] Response for user details of", receiverId, res);
            if (res.ok) return res.json();
            throw new Error("Failed to fetch user details");
          })
          .then((data: OtherUser) => {
            console.log("[DEBUG] Fetched user details for", receiverId, ":", data);
            setConversationUserDetails((prev) => ({ ...prev, [receiverId]: data }));
          })
          .catch((err) => {
            console.error("[DEBUG] Error fetching user details for conversation list:", err);
          });
      }
    });
  }, [conversations, token, user?.id, baseApiUrl, conversationUserDetails]);

  // ---------------------------
  // Right Side: Conversation Detail
  // ---------------------------
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  // Other user for the selected conversation (fetched separately)
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log("[DEBUG] Scrolling to bottom of messages");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch conversation detail when a conversation is selected
  useEffect(() => {
    console.log("[DEBUG] useEffect: Fetching conversation detail for id:", selectedConversationId);
    if (!selectedConversationId || !token) return;
    const fetchConversation = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/conversations/${selectedConversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        console.log("[DEBUG] fetchConversation: response", res);
        if (res.ok) {
          const data = await res.json();
          console.log("[DEBUG] Fetched conversation detail:", data);
          setConversation(data);
        } else {
          console.error("[DEBUG] Failed to fetch conversation. Status:", res.status);
        }
      } catch (err) {
        console.error("[DEBUG] Error fetching conversation:", err);
      }
    };
    fetchConversation();
  }, [selectedConversationId, token]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    console.log("[DEBUG] useEffect: Fetching messages for conversation:", selectedConversationId);
    if (!selectedConversationId || !token) {
      setLoadingMessages(false);
      console.log("[DEBUG] Skipping messages fetch due to missing conversationId or token");
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/messages/${selectedConversationId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        console.log("[DEBUG] fetchMessages: response", res);
        if (res.ok) {
          const msgs = await res.json();
          console.log("[DEBUG] Fetched messages:", msgs);
          setMessages(msgs);
        } else {
          console.error("[DEBUG] Failed to fetch messages. Status:", res.status);
        }
      } catch (err) {
        console.error("[DEBUG] Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
        console.log("[DEBUG] fetchMessages: finished");
      }
    };
    fetchMessages();
  }, [selectedConversationId, token]);

  // Compute the receiver's ID for the selected conversation
  const receiverIdForDetail = conversation
    ? conversation.user1Id === user?.id
      ? conversation.user2Id
      : conversation.user1Id
    : undefined;
  console.log("[DEBUG] receiverIdForDetail computed as:", receiverIdForDetail);

  // Fetch the other user's details for the selected conversation
  useEffect(() => {
    console.log("[DEBUG] useEffect: Fetching other user details for conversation detail");
    if (!receiverIdForDetail || !token) return;
    const fetchOtherUser = async () => {
      try {
        const res = await fetch(`${baseApiUrl}/users/${receiverIdForDetail}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        console.log("[DEBUG] fetchOtherUser: response", res);
        if (res.ok) {
          const userData = await res.json();
          console.log("[DEBUG] Fetched other user details for chat detail:", userData);
          setOtherUser(userData);
        } else {
          console.error("[DEBUG] Failed to fetch other user details. Status:", res.status);
        }
      } catch (err) {
        console.error("[DEBUG] Error fetching other user details:", err);
      }
    };
    fetchOtherUser();
  }, [receiverIdForDetail, token]);

  // Setup socket connection for the selected conversation
  useEffect(() => {
    console.log("[DEBUG] useEffect: Setting up socket connection for conversation:", selectedConversationId);
    if (!selectedConversationId) return;
    if (!socketRef.current) {
      console.log("[DEBUG] Initializing socket connection");
      socketRef.current = io("http://localhost:8800", { transports: ["websocket"] });
    }
    console.log("[DEBUG] Emitting joinRoom for", selectedConversationId);
    socketRef.current.emit("joinRoom", selectedConversationId);
    socketRef.current.on("messageReceived", (message) => {
      console.log("[DEBUG] New message received via socket:", message);
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      console.log("[DEBUG] Cleaning up socket event listeners for messageReceived");
      socketRef.current?.off("messageReceived");
    };
  }, [selectedConversationId]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    console.log("[DEBUG] sendMessage triggered with message:", newMessage);
    if (!newMessage.trim() || !socketRef.current) {
      console.log("[DEBUG] Message empty or socket not connected. Exiting sendMessage.");
      return;
    }
    setSending(true);
    const tempId = Date.now().toString();
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
    };
    console.log("[DEBUG] Adding temporary message to state:", messageData.message);
    setMessages((prev) => [...prev, messageData.message]);
    setNewMessage("");
    socketRef.current.emit("newMessage", messageData);
    console.log("[DEBUG] Emitted newMessage via socket:", messageData);
    setTimeout(() => {
      console.log("[DEBUG] Updating message status to 'sent' for tempId:", tempId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "sent" } : msg
        )
      );
      setSending(false);
    }, 500);
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString()
      ? format(date, "h:mm a")
      : format(date, "MMM d, h:mm a");
  };

  const getInitials = (text: string = "User") => text.charAt(0).toUpperCase();

  if (!token) {
    console.log("[DEBUG] No token present. Rendering sign in prompt.");
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Sign in to access your chats</h2>
          <p className="text-muted-foreground">
            Please log in to view and participate in your conversations.
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
      <Header />
      <div className="flex h-[calc(100vh-4rem)] bg-background border">
        {/* Left Sidebar: Conversation List */}
        <div className="w-full md:w-80 border-r p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Conversations</h1>
            <Button onClick={() => { console.log("[DEBUG] New chat clicked"); }} size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </div>
          {loadingConversations ? (
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
              <Button onClick={() => { console.log("[DEBUG] New chat clicked from empty state"); }} variant="outline" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Start a new chat
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => {
                const receiverIdForConv = getReceiverId(conv);
                const otherUserData = receiverIdForConv ? conversationUserDetails[receiverIdForConv] : null;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      console.log("[DEBUG] Conversation clicked:", conv);
                      setSelectedConversationId(conv.id);
                    }}
                    className={cn(
                      "cursor-pointer hover:bg-accent transition-colors p-3 flex items-center gap-3 rounded-md border-b",
                      selectedConversationId === conv.id && "bg-accent"
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {otherUserData?.profilePic ? (
                        <Image
                          src={otherUserData.profilePic}
                          alt={otherUserData.username}
                          width={40}
                          height={40}
                          loading="lazy"
                          quality={100}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : otherUserData?.username ? (
                        getInitials(otherUserData.username)
                      ) : (
                        (conv.title?.[0] || "C").toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {otherUserData?.username || conv.title || `Chat ${conv.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Right Side: Conversation Detail */}
        <div className="flex-1 p-4 flex flex-col">
          {selectedConversationId ? (
            <>
              {/* Chat header */}
              <div className="border-b p-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => {
                    console.log("[DEBUG] Back button clicked, clearing selected conversation");
                    setSelectedConversationId(null);
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {otherUser?.profilePic ? (
                    <Image
                      src={otherUser.profilePic}
                      alt={otherUser.username}
                      width={40}
                      height={40}
                      loading="lazy"
                      quality={100}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : otherUser?.username ? (
                    getInitials(otherUser.username)
                  ) : (
                    "C"
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-medium">
                    {otherUser?.username || "Chat"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {conversation ? `Conversation ID: ${conversation.id}` : "Loading conversation details..."}
                  </p>
                </div>
              </div>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/5">
                {loadingMessages ? (
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
                      const isCurrentUser = String(msg.userId) === String(user?.id);
                      return (
                        <div key={msg.id || index} className="w-full">
                          <div className={cn("flex gap-2 w-full", isCurrentUser ? "justify-end" : "justify-start")}>
                            {isCurrentUser ? (
                              <>
                                <div className="max-w-[75%] flex flex-col ml-auto items-end">
                                  <div className="px-3 py-2 rounded-lg bg-primary text-primary-foreground rounded-br-none">
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <span>{formatMessageDate(msg.createdAt)}</span>
                                    {msg.status && (
                                      <span className="ml-1">
                                        {msg.status === "sending" && "Sending..."}
                                        {msg.status === "sent" && "Sent"}
                                        {msg.status === "delivered" && "Delivered"}
                                        {msg.status === "read" && "Read"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(user?.username)}
                                  </AvatarFallback>
                                </Avatar>
                              </>
                            ) : (
                              <>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(otherUser?.username || "U")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="max-w-[75%] flex flex-col items-start">
                                  <div className="px-3 py-2 rounded-lg bg-accent rounded-bl-none">
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <span>{formatMessageDate(msg.createdAt)}</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              {/* Message input */}
              <div className="border-t p-3">
                <form onSubmit={sendMessage} className="flex items-center gap-2 max-w-5xl">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                      console.log("[DEBUG] Input changed:", e.target.value);
                      setNewMessage(e.target.value);
                    }}
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
            <div className="flex flex-col items-center justify-center flex-1 p-6 bg-accent/5">
              <div className="text-center space-y-4 max-w-md">
                <MessageSquare className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Select a conversation</h2>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar or start a new chat to begin messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
