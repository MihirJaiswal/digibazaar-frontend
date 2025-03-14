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
    <div className="flex flex-col w-full rounded-lg bg-blue-100 dark:bg-zinc-950 p-4">
      {/* Community Content Container */}
      <div className="flex flex-col w-full gap-4">
        {/* Community Icon & Info - stack on mobile, row on larger screens */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
          {/* Community Icon - centered on mobile */}
          <div className="flex-shrink-0">
            {community.image ? (
              <Image
                src={community.image}
                alt="Community Icon"
                width={80}
                height={80}
                className="rounded-full w-16 h-16 sm:w-20 sm:h-20 border-gray-200 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 dark:bg-zinc-950 border-4 border-gray-200 shadow-md"></div>
            )}
          </div>

          {/* Community Info - text centered on mobile, left aligned on larger screens */}
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold">{community.name}</h1>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{memberCount} members</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">
                  Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Join/Leave Button - full width on mobile */}
        {user && (
          <div className="w-full sm:flex sm:justify-end mt-2 sm:mt-0">
            <Button
              className="w-full sm:w-auto px-4 py-2 rounded-full text-sm bg-gradient-to-r from-purple-500 to-cyan-600 text-white"
              variant={isMember ? "outline" : "default"}
              onClick={handleJoinLeave}
            >
              {isMember ? "Leave" : "Join"} Community
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}