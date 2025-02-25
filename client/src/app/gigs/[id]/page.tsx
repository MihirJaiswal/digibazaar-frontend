import Link from "next/link"

async function getGig(id: string) {
  const res = await fetch(`http://localhost:8800/api/gigs/single/${id}`)
  if (!res.ok) throw new Error("Failed to fetch gig")
  return res.json()
}

export default async function GigPage({ params }: { params: { id: string } }) {
  const gig = await getGig(params.id)

  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to all gigs
      </Link>
      <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
      <p className="text-gray-600 mb-4">{gig.description}</p>
      {/* Add more gig details here */}
    </div>
  )
}

