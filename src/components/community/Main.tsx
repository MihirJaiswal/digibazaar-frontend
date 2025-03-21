"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/community/Sidebar";
import Posts from "@/components/community/AllPost";
import UserPosts from "@/components/community/UserPost";
import UserCommunities from "@/components/community/UserCommunities";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/global/Header";
import Hero from "@/components/community/Hero";
const MainPage = () => {
  const { user } = useAuthStore();
  const pathname = usePathname(); // ✅ Detect current route

  return (
    <>
      <Header />
      <div className="flex">
        {/* ✅ Sidebar with Navigation */}
        
        <Sidebar />
        {/* ✅ Dynamic Content Based on Route */}
        <div className="flex-1 ">
          {pathname === "/community" && <Hero/> }
          {pathname === "/community/posts" && <Posts />}
          {user && pathname === "/community/user/posts" && <UserPosts />}
          {user && pathname === "/community/user/communities" && <UserCommunities />}
        </div>
      </div>
    </>
  );
};

export default MainPage;
