import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PackageIcon } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  mainImage: string;
  price: number;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

interface ProductTableProps {
  items: OrderItem[];
}

const ProductTable: React.FC<ProductTableProps> = ({ items }) => {
  return (
    <Card className="overflow-hidden shadow-card animate-entrance">
      <CardHeader className="bg-secondary/30 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <PackageIcon className="h-5 w-5 text-primary" />
          Ordered Products
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-auto scrollbar-hide">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right w-[100px]">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-secondary/30 card-transition">
                  <TableCell className="p-2">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                      <Image
                        src={item.product?.mainImage || '/placeholder.svg'}
                        alt={item.product?.title || 'Product image'}
                        width={80}
                        height={80}
                        quality={100}
                        className="h-full w-full object-cover object-center"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="align-middle font-medium">
                    {item.product?.title || `Product ${item.productId}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-center min-w-[36px] h-8 px-2 bg-secondary rounded-full text-sm font-medium">
                      {item.quantity}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductTable;
