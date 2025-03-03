"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ Detect active route
import { useAuthStore } from "@/store/authStore";
import { Home, FileText, PlusCircle, User, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const GigsSidebar = () => {
  const { user } = useAuthStore();
  const pathname = usePathname(); // ✅ Get current route

  return (
    <aside className="w-72 bg-white border-r border-gray-300 p-4 h-screen shadow-md border-t shadow-gray-300 sticky top-0">
      {/* Navigation Section */}
      <Card className="shadow-none border-none">
        <CardHeader className="bg-white border-b border-gray-300">
          <CardTitle className="text-lg font-bold">Gigs Menu</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <nav className="space-y-2">
            <Link
              href="/gigs"
              className={`flex items-center p-3 w-full rounded-md transition ${
                pathname === "/gigs" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Link>
            <Link
              href="/gigs/gig"
              className={`flex items-center p-3 w-full rounded-md transition ${
                pathname === "/gigs/gig" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              All Gigs
            </Link>
            {user && (
              <>
                <Link
                  href="/gigs/your-gigs"
                  className={`flex items-center p-3 w-full rounded-md transition ${
                    pathname === "/gigs/your-gigs" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Your Gigs
                </Link>
                <Link
                  href="/gigs/create-gig"
                  className={`flex items-center p-3 w-full rounded-md transition ${
                    pathname === "/gigs/create-gig" ? "bg-gray-300 text-gray-900 font-semibold" : "hover:bg-gray-200"
                  }`}
                >
                  <PlusCircle className="w-5 h-5 mr-3" />
                  Create Gig
                </Link>
              </>
            )}
          </nav>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      {/* Settings and About */}
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

export default GigsSidebar;
