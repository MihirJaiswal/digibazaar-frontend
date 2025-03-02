"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostList } from "@/components/community/post-list";
import { CommunityMembers } from "@/components/community/community-members";
import { CommunityInfo } from "@/components/community/community-info";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Sidebar from "@/components/community/Sidebar"; // ✅ Import Sidebar
import Header from "@/components/global/Header";

export default function CommunityPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const communityResponse = await axios.get(`http://localhost:8800/api/communities/${id}`, {
          withCredentials: true,
        });
        setCommunity(communityResponse.data);

        const postsResponse = await axios.get(`http://localhost:8800/api/community-posts/community/${id}`, {
          withCredentials: true,
        });
        setPosts(postsResponse.data);
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 max-w-5xl mx-auto py-6 space-y-6 px-6">
            <Skeleton className="h-40 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!community) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 max-w-5xl mx-auto py-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Community not found</h1>
            <p className="mb-6">The community you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/communities")}>Browse Communities</Button>
          </div>
        </div>
      </>
    );
  }

  const defaultRules = [
    "Be respectful to others",
    "No spam or self-promotion",
    "Use appropriate tags for NSFW content",
    "No hate speech or harassment",
  ];

  const rules = Array.isArray(community.rules)
    ? community.rules
    : typeof community.rules === "string"
    ? community.rules.split("\n").map((rule: string) => rule.trim())
    : defaultRules;

  return (
    <>
      <Header />
      <div className="flex">
        {/* ✅ Sidebar (Fixed & No Scrollbar) */}
        <Sidebar />

        {/* ✅ Main Content */}
        <div className="flex-1 max-w-7xl mx-auto py-4 space-y-6 px-6">
          {/* Cover Image */}
          {community.coverImage && (
            <div className="relative w-full h-48 overflow-hidden rounded-md">
              <Image src={community.coverImage} alt="Community Cover" layout="fill" objectFit="cover" />
            </div>
          )}

          {/* Community Info */}
          <CommunityInfo community={community} />

          {/* Tabs & Create Post */}
          <div className="flex justify-between items-center border-b pb-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="flex justify-start">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>
            </Tabs>
            {user && (
              <Button asChild className="ml-4">
                <Link href={`/community/communities/${id}/submit`}>
                  <Plus className="mr-2 h-4 w-4" /> Create Post
                </Link>
              </Button>
            )}
          </div>

          {/* Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section (Posts) */}
            <div className="lg:col-span-2">
              <PostList posts={posts} />
              <Tabs>
                <TabsContent value="members" className="pt-4">
                  <CommunityMembers communityId={id as string} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Section (Rules & Info) */}
            <div className="lg:col-span-1 w-96">
              <Card className="border border-gray-300 rounded-lg shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{community.description}</p>
                </CardContent>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Community Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {rules.map((rule: string, index: number) => (
                      <li key={index} className="bg-gray-100 p-3 rounded-md border">
                        <span className="font-medium text-gray-700">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
