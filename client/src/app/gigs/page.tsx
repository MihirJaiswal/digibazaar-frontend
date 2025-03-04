"use client";

import Header from "@/components/global/Header";
import GigsSidebar from "@/components/gigs/GigsSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, CheckCircle, Search, Star } from "lucide-react";

export default function Home() {
  // Mock data for featured categories
  const categories = [
    { id: 1, name: "Web Development", icon: "💻", count: 1200 },
    { id: 2, name: "Graphic Design", icon: "🎨", count: 950 },
    { id: 3, name: "Digital Marketing", icon: "📱", count: 820 },
    { id: 4, name: "Content Writing", icon: "✍️", count: 760 },
    { id: 5, name: "Video Editing", icon: "🎬", count: 540 },
    { id: 6, name: "Voice Over", icon: "🎤", count: 480 },
  ];

  // Mock data for top gigs
  const topGigs = [
    {
      id: 1,
      title: "I will design a professional website for your business",
      price: 120,
      rating: 4.9,
      reviews: 342,
      seller: { name: "JohnDev", avatar: "/placeholder.svg?height=40&width=40", level: "Top Rated" },
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "I will create stunning logo designs for your brand",
      price: 85,
      rating: 4.8,
      reviews: 217,
      seller: { name: "DesignPro", avatar: "/placeholder.svg?height=40&width=40", level: "Level 2" },
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "I will write SEO-optimized content for your website",
      price: 65,
      rating: 4.7,
      reviews: 189,
      seller: { name: "ContentQueen", avatar: "/placeholder.svg?height=40&width=40", level: "Level 2" },
      image: "/placeholder.svg?height=200&width=300",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Sidebar & Content Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <GigsSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Hero Section */}
          <section className="relative overflow-hidden before:absolute before:top-0 before:left-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] dark:before:bg-[url('https://preline.co/assets/svg/examples-dark/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:w-full before:h-full before:-z-10 before:transform before:-translate-x-1/2">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-10 text-center">
        
        {/* 🌟 Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-neutral-200">
          Find the Perfect
          <span className="bg-clip-text bg-gradient-to-tl from-blue-600 to-violet-600 text-transparent">
            {" "} Freelance Services
          </span>
        </h1>

        {/* ✨ Subtitle */}
        <p className="mt-5 text-lg text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Connect with talented freelancers and get your projects done quickly and efficiently on DigiBazar.
        </p>


        {/* 🎯 CTA Buttons */}
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild className="bg-gradient-to-tl from-blue-600 to-violet-600 hover:from-violet-600 hover:to-blue-600 text-white px-6 py-3 text-lg font-semibold">
            <Link href="/gigs">
              Browse Gigs <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 px-6 py-3 text-lg">
            <Link href="/signup?seller=true">
              Join as Freelancer
            </Link>
          </Button>
        </div>

        {/* 🌍 Community Info */}
        <div className="mt-5 flex justify-center items-center gap-x-2">
          <span className="text-sm text-gray-600 dark:text-neutral-400">Community:</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">DigiBazar</span>
          <span className="w-5 h-5 text-gray-300 dark:text-neutral-600">|</span>
          <Link href="/community" className="inline-flex items-center gap-x-1 text-sm text-blue-600 hover:underline font-medium dark:text-blue-500">
            Join Community <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>


          {/* Featured Categories */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => (
                  <Link key={category.id} href={`/gigs?category=${category.name}`} className="group">
                    <Card className="h-full transition-all duration-300 hover:shadow-md group-hover:border-primary">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{category.icon}</div>
                        <h3 className="font-medium mb-1 group-hover:text-primary">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.count} services</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
