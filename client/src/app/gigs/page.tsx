import Link from "next/link"
import { GigList } from "@/components/GigList"
import DebugAuth from "@/components/Debug"

export default async function Home() {
  const gigs = await fetch("http://localhost:8800/api/gigs").then((res) => res.json())

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Available Gigs</h1>
      <Link
        href="/gigs/create"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block"
      >
        Create New Gig
      </Link>
      <DebugAuth/>
      <GigList gigs={gigs} />
    </main>
  )
}

