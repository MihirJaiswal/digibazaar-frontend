import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from './ui/button';

interface GigCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export default function GigCard({ id, title, description, price, image }: GigCardProps) {
  return (
    <Card className="overflow-hidden">
      <Image src={image || "/placeholder.svg"} alt={title} width={300} height={200} className="w-full object-cover h-48" />
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{description.substring(0, 100)}...</p>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 flex justify-between items-center">
        <span className="font-bold text-lg">${price}</span>
        <Link href={`/gigs/${id}`}>
          <Button variant="outline">View Gig</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}