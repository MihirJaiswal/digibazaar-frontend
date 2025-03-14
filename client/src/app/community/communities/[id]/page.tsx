"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostList } from "@/components/community/post-list";
import { CommunityMembers } from "@/components/community/community-members";
import { CommunityInfo } from "@/components/community/community-info";
import { Menu, Plus, X } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Sidebar from "@/components/community/Sidebar";
import Header from "@/components/global/Header";

// Define an interface for community data
interface Community {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  rules?: string[] | string;
}

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Narrow id to a string
  const { id } = params;
  if (!id || typeof id !== "string") {
    return <div>Invalid community id</div>;
  }

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

    fetchData();
  }, [id]);

  // This function toggles the mobile sidebar state
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex flex-col md:flex-row bg-white dark:bg-zinc-900 min-h-screen">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="md:hidden p-4">
            <Button variant="outline" size="icon" onClick={toggleMobileSidebar} className="mb-4">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 max-w-5xl mx-auto py-4 space-y-4 px-4 md:px-6 w-full">
            <Skeleton className="h-32 md:h-40 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-32 md:h-40 w-full rounded-lg" />
                <Skeleton className="h-32 md:h-40 w-full rounded-lg" />
              </div>
              <Skeleton className="h-64 md:h-80 w-full rounded-lg" />
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
        <div className="flex flex-col md:flex-row bg-white dark:bg-zinc-900 min-h-screen">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <div className="md:hidden p-4">
            <Button variant="outline" size="icon" onClick={toggleMobileSidebar} className="mb-4">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 max-w-5xl mx-auto py-6 md:py-10 text-center px-4">
            <h1 className="text-xl md:text-2xl font-bold mb-4">Community not found</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              The community you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push("/communities")}>Browse Communities</Button>
          </div>
        </div>
      </>
    );
  }

  // Default rules if community.rules is not defined correctly
  const defaultRules = [
    "Be respectful to others",
    "No spam or self-promotion",
    "Use appropriate tags for NSFW content",
    "No hate speech or harassment",
  ];

  const rules = Array.isArray(community.rules)
    ? community.rules
    : typeof community.rules === "string"
    ? community.rules.split("\n").map((rule) => rule.trim())
    : defaultRules;

  return (
    <>
      <Header />
      <div className="flex flex-col md:flex-row bg-white dark:bg-zinc-900 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden px-6 py-3 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-lg"
                onClick={() => router.push('/community/communities/explore')}
              >
                Back
              </Button>
              
              <h2 className="text-lg font-semibold truncate flex-1 text-center px-4">
                {community.name}
              </h2>

              {user && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  asChild 
                  className="ml-auto rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Link href={`/community/communities/${id}/submit`} className="flex items-center">
                    <Plus className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>



        {/* Main Content */}
        <div className="flex-1 w-full max-w-7xl mx-auto py-3 md:py-4 space-y-4 md:space-y-6 px-4 md:px-6">
          {/* Cover Image */}
          {community.coverImage && (
            <div className="relative w-full h-32 md:h-48 overflow-hidden rounded-lg shadow">
              <Image
                src={community.coverImage}
                alt="Community Cover"
                layout="fill"
                objectFit="cover"
                className="transition-transform hover:scale-105 duration-300"
              />
            </div>
          )}

          {/* Community Info */}
          <CommunityInfo community={community} />

          {/* Community Content */}
          <Tabs defaultValue="posts" className="block">
            {/* Tab Triggers and Create Post Button */}
            <div className="flex justify-between items-center border-b pb-2 overflow-x-auto">
              <TabsList className="flex justify-start h-auto p-1">
                <TabsTrigger value="posts" className="text-sm md:text-base py-1 px-2 md:px-3">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="about" className="text-sm md:text-base py-1 px-2 md:px-3">
                  About
                </TabsTrigger>
                <TabsTrigger value="members" className="text-sm md:text-base py-1 px-2 md:px-3">
                  Members
                </TabsTrigger>
              </TabsList>
              <div className="hidden md:block">
                {user && (
                  <Button size="sm" asChild>
                    <Link href={`/community/communities/${id}/submit`}>
                      <Plus className="mr-1 md:mr-2 h-4 w-4" /> Create Post
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-4">
              {/* Left Section (Posts, About, Members) */}
              <div className="md:col-span-2 order-2 md:order-1">
                <TabsContent value="posts" className="mt-2">
                  <PostList posts={posts} />
                </TabsContent>
                <TabsContent value="about" className="mt-2">
                  <Card className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300">{community.description}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="members" className="mt-2">
                  <CommunityMembers communityId={id} />
                </TabsContent>
              </div>

              {/* Right Section (Rules - Always Visible) */}
              <div className="order-1 md:order-2 md:col-span-1">
                <Card className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base md:text-lg font-semibold">Community Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 md:space-y-3">
                      {rules.map((rule, index) => (
                        <li
                          key={index}
                          className="bg-gray-50 dark:bg-zinc-800 p-2 md:p-3 rounded-md border border-gray-200 dark:border-gray-700 text-sm md:text-base"
                        >
                          <span className="font-medium text-gray-700 dark:text-gray-300">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
