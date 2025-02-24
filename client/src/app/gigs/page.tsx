"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Gig = {
  id: string
  title: string
  description: string
  price: number
  seller: {
    username: string
  }
}

export default function Gigs() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchGigs()
  }, [])

  const fetchGigs = async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/gigs?search=${searchTerm}`)
      if (response.ok) {
        const data = await response.json()
        setGigs(data)
      } else {
        throw new Error("Failed to fetch gigs")
      }
    } catch (error) {
      console.error("Error fetching gigs:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGigs()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gigs</h1>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search gigs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.map((gig) => (
          <Link href={`/gigs/${gig.id}`} key={gig.id} className="block">
            <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{gig.title}</h2>
              <p className="text-gray-600 mb-2">{gig.description.substring(0, 100)}...</p>
              <p className="text-lg font-bold">${gig.price}</p>
              <p className="text-sm text-gray-500 mt-2">by {gig.seller.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

