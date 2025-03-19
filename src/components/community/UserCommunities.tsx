"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

export default function UserCommunities() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [memberCounts, setMemberCounts] = useState<{ [key: string]: number }>({});

  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/community-members`;

  useEffect(() => {
    if (!user) return;

    const fetchUserJoinedCommunities = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/communities/user/${user.id}/joined`);
        setCommunities(data);
      } catch (error) {
        console.error("Error fetching user communities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserJoinedCommunities();
  }, [user]);

  useEffect(() => {
    const fetchCommunityMembers = async () => {
      try {
        if (communities.length === 0) return;

        const memberCountsTemp: { [key: string]: number } = {};

        for (const community of communities) {
          const { data } = await axios.get(`${API_BASE}/${community.id}`, { withCredentials: true });
          memberCountsTemp[community.id] = data.length;
        }

        setMemberCounts(memberCountsTemp);
      } catch (error) {
        console.error("Error fetching community members:", error);
      }
    };

    if (communities.length > 0) {
      fetchCommunityMembers();
    }
  }, [communities]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {communities.length > 0 ? (
        communities.map((community) => (
          <Card key={community.id} className="rounded-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                {/* 🛠 Show Image if Available */}
                {community.image && community.image.trim() !== "" ? (
                  <Image
                    src={community.image}
                    alt={community.name}
                    width={100}
                    height={100}
                    className="rounded-full h-12 w-12"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-full">
                    NA
                  </div>
                )}
                <div className="flex flex-col gap-2 justify-start items-start ml-2">
                <CardTitle>{community.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{memberCounts[community.id] || 0} members</span>
              </CardDescription>
                </div>
              </div>

        
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm text-muted-foreground">{community.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/community/communities/${community.id}`}>View Community</Link>
              </Button>
            </CardFooter>
          </Card>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-300 text-center col-span-3">You haven&apos;t joined any communities yet.</p>
      )}
    </div>
  );
}
