// components/store/templates/ModernTemplate.jsx
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function ModernTemplate({ viewMode, currentPage }: { viewMode: string, currentPage: string }) {
  return (
    <div className="min-h-[600px]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-gray-900 px-4 md:px-6">
        <div className="text-xl font-bold text-white">Modern Store</div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-white">Home</a>
          <a href="#" className="text-sm font-medium text-white">Products</a>
          <a href="#" className="text-sm font-medium text-white">About</a>
          <a href="#" className="text-sm font-medium text-white">Contact</a>
        </nav>
      </header>
      <main>
        <section className="relative h-96">
          <Image
            src="/modern-hero.jpg"
            alt="Modern Hero"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-4xl font-bold">Modern Aesthetics</h1>
            <p className="max-w-2xl mx-auto mt-4">
              Experience a sleek, contemporary design that sets your store apart.
            </p>
            <div className="mt-4">
              <Button variant="outline" className="border-white text-white">
                Explore
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 py-6 text-center">
        <p className="text-sm text-white">© 2023 Modern Store. All rights reserved.</p>
      </footer>
    </div>
  )
}
