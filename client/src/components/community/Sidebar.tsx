"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ Get active route
import { useAuthStore } from "@/store/authStore";
import { Home, FileText, User, Users, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Sidebar = () => {
  const { user } = useAuthStore();
  const pathname = usePathname(); // ✅ Detect current page

  return (
    <aside className="w-72 bg-white border-r border-gray-300 p-4 h-screen shadow-md border-t shadow-gray-300 sticky top-0">
      {/* Navigation Section */}
      <Card className="shadow-none border-none">
        <CardHeader className="bg-white border-b border-gray-300">
          <CardTitle className="text-lg font-bold">Menu</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <nav className="space-y-2">
            <Link
              href="/community"
              className={`flex items-center p-3 w-full rounded-md transition ${
                pathname === "/community" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Link>
            <Link
              href="/community/communities/posts"
              className={`flex items-center p-3 w-full rounded-md transition ${
                pathname === "/community/communities/posts" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              Posts
            </Link>
            {user && (
              <>
                <Link
                  href="/community/communities/user/posts"
                  className={`flex items-center p-3 w-full rounded-md transition ${
                    pathname === "/community/communities/user/posts" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Your Posts
                </Link>
                <Link
                  href="/community/communities/user/communities"
                  className={`flex items-center p-3 w-full rounded-md transition ${
                    pathname === "/community/communities/user/communities" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
                  }`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Your Communities
                </Link>
              </>
            )}
          </nav>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      {/* Settings and About (Separate Pages) */}
      <Card className="shadow-none border-none">
        <CardContent>
          <Link
            href="/settings"
            className={`flex items-center p-3 rounded-md transition ${
              pathname === "/settings" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
          <Link
            href="/about"
            className={`flex items-center p-3 rounded-md transition ${
              pathname === "/about" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
            }`}
          >
            ℹ️ About
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
};

export default Sidebar;
