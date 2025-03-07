// components/store/templates/DefaultTemplate.jsx
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function DefaultTemplate({ viewMode, currentPage }: { viewMode: string, currentPage: string }) {
  return (
    <div className="min-h-[600px]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
        <div className="text-xl font-bold">Default Store</div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium">Home</a>
          <a href="#" className="text-sm font-medium">Products</a>
          <a href="#" className="text-sm font-medium">About</a>
          <a href="#" className="text-sm font-medium">Contact</a>
        </nav>
      </header>
      <main>
        <section className="py-12 text-center">
          <h1 className="text-3xl font-bold">Welcome to the Default Store</h1>
          <p className="max-w-2xl mx-auto text-muted">
            Discover our great products and enjoy an exceptional shopping experience.
          </p>
          <div className="mt-4">
            <Button>Shop Now</Button>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-center">
        <p className="text-sm text-muted">© 2023 Default Store. All rights reserved.</p>
      </footer>
    </div>
  )
}
