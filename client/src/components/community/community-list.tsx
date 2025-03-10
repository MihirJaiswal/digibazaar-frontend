"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import React from "react";

// Define interface for a community
interface Community {
  id: string;
  name: string;
  description: string;
  image?: string;
}

// ----------------------
// Memoized Community Card Component
// ----------------------
interface CommunityCardProps {
  community: Community;
  memberCount: number;
}

const CommunityCard: React.FC<CommunityCardProps> = React.memo(({ community, memberCount }) => {
  return (
    <Card className="rounded-md shadow-sm transition-transform hover:scale-105 bg-white dark:bg-zinc-950 border dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          {community.image && community.image.trim() !== "" ? (
            <Image
              src={community.image}
              alt={community.name}
              width={100}
              height={100}
              className="rounded-full h-12 w-12 object-cover"
            />
          ) : (
            <div className="h-12 w-12 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-full">
              NA
            </div>
          )}
          <div className="flex flex-col gap-2 ml-2">
            <CardTitle>{community.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span className="dark:text-gray-400">{memberCount} members</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
          {community.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-cyan-600 text-white">
          <Link href={`/community/communities/${community.id}`}>View Community</Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

// ----------------------
// Main CommunityList Component
// ----------------------
export function CommunityList() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);

  const API_BASE = "http://localhost:8800/api/community-members";

  // Fetch communities on mount
  useEffect(() => {
    async function fetchCommunities() {
      try {
        const { data } = await axios.get<Community[]>("http://localhost:8800/api/communities");
        setCommunities(data);
        setFilteredCommunities(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  // Fetch member counts concurrently
  useEffect(() => {
    if (communities.length === 0) return;

    const fetchMemberCounts = async () => {
      try {
        const requests = communities.map((community) =>
          axios.get(`${API_BASE}/${community.id}`, { withCredentials: true })
        );
        const responses = await Promise.all(requests);
        const counts: Record<string, number> = {};
        responses.forEach((res, index) => {
          counts[communities[index].id] = res.data.length;
        });
        setMemberCounts(counts);
      } catch (error) {
        console.error("Error fetching community members:", error);
      }
    };

    fetchMemberCounts();
  }, [communities]);

  // Debounced search function (runs after user stops typing for 300ms)
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setFilteredCommunities(communities);
      } else {
        const filtered = communities.filter((community) =>
          community.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredCommunities(filtered);
      }
    }, 300),
    [communities]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
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
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Search Bar */}
      <div className="relative w-full max-w-7xl mx-auto">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 pr-4 py-2 w-full border bg-white dark:bg-zinc-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Community Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCommunities.length > 0 ? (
          filteredCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              memberCount={memberCounts[community.id] || 0}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No communities found.</p>
        )}
      </div>
    </div>
  );
}
