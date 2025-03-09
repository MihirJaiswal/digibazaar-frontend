"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
export default function HeroSection() {
  const [copyText, setCopyText] = useState("npm i preline");
  const user = useAuthStore((state) => state.user);

  const handleCopy = () => {
    navigator.clipboard.writeText("npm i preline");
    setCopyText("Copied!");
    setTimeout(() => setCopyText("npm i preline"), 2000);
  };

  return (
    <section className="relative overflow-hidden before:absolute before:top-0 before:left-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] dark:before:bg-[url('https://preline.co/assets/svg/examples-dark/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:w-full before:h-full before:-z-10 before:transform before:-translate-x-1/2">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-10">

        {/* 🔔 Announcement Banner */}
        <div className="flex justify-center">
          <Link
            className="inline-flex items-center gap-x-2 bg-white border border-gray-200 text-sm text-gray-800 p-1 ps-3 rounded-full transition hover:border-gray-300 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-600"
            href={ user ? "/community/communities/create" : "/auth/login" }
          >
            Create your community
            <span className="py-1.5 px-2.5 inline-flex justify-center items-center rounded-full bg-gray-200 font-semibold text-sm text-gray-600 dark:bg-neutral-700 dark:text-neutral-400">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* 🏆 Title */}
        <div className="mt-5 max-w-2xl text-center mx-auto">
          <h1 className="font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
            Let's Connect
            <span className="bg-clip-text bg-gradient-to-tl from-blue-600 to-violet-600 text-transparent">
              {" "} & Build
            </span>
          </h1>
        </div>

        {/* 📜 Subtitle */}
        <div className="mt-5 max-w-3xl text-center mx-auto">
          <p className="text-lg text-gray-600 dark:text-neutral-400">
            Digibazar Community is the place to share ideas, connect with like-minded people, and build together. Join discussions and make an impact.
          </p>
        </div>

        {/* 🎯 Buttons */}
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild className="bg-gradient-to-tl from-blue-600 to-violet-600 hover:from-violet-600 hover:to-blue-600 text-white px-6 py-3 text-lg font-semibold">
            <Link href="/community/explore">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
     
        </div>

        {/* 📦 Package Manager Info */}
        <div className="mt-5 flex justify-center items-center gap-x-2">
          <span className="text-sm text-gray-600 dark:text-neutral-400">Community:</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">Digibazar</span>
          <span className="w-5 h-5 text-gray-300 dark:text-neutral-600">|</span>
          <Link href="#" className="inline-flex items-center gap-x-1 text-sm text-blue-600 hover:underline font-medium dark:text-blue-500">
            Join Community<ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
