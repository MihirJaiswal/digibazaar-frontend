import Link from "next/link"

type Gig = {
  id: string
  title: string
  description: string
}

export function GigList({ gigs }: { gigs: Gig[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {gigs.map((gig) => (
        <Link key={gig.id} href={`/gigs/${gig.id}`} className="border p-4 rounded hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">{gig.title}</h2>
          <p className="text-gray-600">{gig.description.substring(0, 100)}...</p>
        </Link>
      ))}
    </div>
  )
}

