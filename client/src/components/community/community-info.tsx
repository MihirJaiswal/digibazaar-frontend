"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "../../store/authStore";
import Image from "next/image";

interface CommunityInfoProps {
  community: any;
}

export function CommunityInfo({ community }: CommunityInfoProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore.getState().token;

  const [memberCount, setMemberCount] = useState<number>(community.memberCount || 0);
  const [isMember, setIsMember] = useState<boolean>(false);

  const API_BASE = "http://localhost:8800/api/community-members";

  useEffect(() => {
    const fetchCommunityMembers = async () => {
      if (!community?.id) return;

      try {
        const { data } = await axios.get(`${API_BASE}/${community.id}`, { withCredentials: true });
        setMemberCount(data.length);

        if (user) {
          const userIsMember = data.some((member: any) => member.userId === user.id);
          setIsMember(userIsMember);
        }
      } catch (error) {
        console.error("Error fetching community members:", error);
      }
    };

    fetchCommunityMembers();
  }, [community.id, user]);

  const handleJoinLeave = async () => {
    if (!user || !user.id) {
      console.error("User ID is missing!");
      return;
    }

    try {
      if (isMember) {
        await axios.post(
          `${API_BASE}/leave`,
          { communityId: community.id, userId: user.id },
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            withCredentials: true,
          }
        );
        setIsMember(false);
        setMemberCount((prev) => Math.max(prev - 1, 0));
      } else {
        await axios.post(
          `${API_BASE}/join`,
          { communityId: community.id, userId: user.id },
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            withCredentials: true,
          }
        );
        setIsMember(true);
        setMemberCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error joining/leaving community:", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-muted/30 w-full rounded-lg">
      {/* Left Section (Community Icon & Info) */}
      <div className="flex items-center space-x-4">
        {/* Community Icon */}
        {community.image ? (
          <Image
            src={community.image}
            alt="Community Icon"
            width={80}
            height={80}
            className="rounded-full w-20 h-20 border-gray-200 shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-gray-200 shadow-md"></div>
        )}

        {/* Community Info */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">{community.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount} members</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section (Join/Leave Button) */}
      {user && (
        <Button
          className="px-5 py-2 rounded-full text-sm mt-4 sm:mt-0 sm:ml-auto bg-gradient-to-r from-purple-500 to-cyan-600 text-white"
          variant={isMember ? "outline" : "default"}
          onClick={handleJoinLeave}
        >
          {isMember ? "Leave" : "Join"} Community
        </Button>
      )}
    </div>
  );
}
