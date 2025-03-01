"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../../store/authStore";

interface CommunityInfoProps {
  community: any;
}

export function CommunityInfo({ community }: CommunityInfoProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore.getState().token;

  const [memberCount, setMemberCount] = useState<number>(community.memberCount || 0);
  const [isMember, setIsMember] = useState<boolean>(false);

  const API_BASE = "http://localhost:8800/api/community-members";

  const fetchCommunityMembers = async () => {
    if (!community?.id) return;

    try {
      console.log("🔍 Fetching members for:", community.id);
      const { data } = await axios.get(`${API_BASE}/${community.id}`, { withCredentials: true });

      console.log("📥 Fetched members:", data);
      setMemberCount(data.length);

      if (user) {
        const userIsMember = data.some((member: any) => member.userId === user.id);
        console.log("🟢 User membership status:", userIsMember);
        setIsMember(userIsMember);
      }
    } catch (error) {
      console.error("❌ Error fetching community members:", error);
    }
  };

  useEffect(() => {
    fetchCommunityMembers();
  }, [community.id, user]);

  const handleJoinCommunity = async () => {
    if (!user || !user.id) {
      console.error("❌ User ID is missing!");
      return;
    }

    try {
      console.log("📤 Sending Join Request...");
      await axios.post(
        `${API_BASE}/join`,
        { communityId: community.id, userId: user.id },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        }
      );

      console.log("✅ Successfully joined the community!");
      setIsMember(true);
      setMemberCount((prev) => prev + 1);
    } catch (error: any) {
      console.error("❌ Error joining community:", error.response?.data || error.message);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!user || !user.id) {
      console.error("❌ User ID is missing!");
      return;
    }

    try {
      console.log("📤 Sending Leave Request...");
      await axios.post(
        `${API_BASE}/leave`,
        { communityId: community.id, userId: user.id },
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          withCredentials: true,
        }
      );

      console.log("✅ Successfully left the community!");
      setIsMember(false);
      setMemberCount((prev) => Math.max(prev - 1, 0));
    } catch (error: any) {
      console.error("❌ Error leaving community:", error.response?.data || error.message);
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">r/{community.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount} members</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">{community.description}</p>
        </div>

        <Card className="w-full md:w-64">
          <CardHeader>
            <CardTitle>About Community</CardTitle>
            <CardDescription>r/{community.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p className="font-medium">Created</p>
              <p className="text-muted-foreground">{new Date(community.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-sm">
              <p className="font-medium">Members</p>
              <p className="text-muted-foreground">{memberCount}</p>
            </div>

            {user && (
              <Button
                className="w-full"
                variant={isMember ? "outline" : "default"}
                onClick={isMember ? handleLeaveCommunity : handleJoinCommunity}
              >
                {isMember ? "Leave" : "Join"} Community
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
