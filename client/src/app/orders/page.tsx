'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  type Order = {
    id: string;
    gig: {
      title: string;
      price: number;
    };
    status: string;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/get-buyer-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const confirmOrder = async (orderId: string) => {
    try {
      await api.put(`/orders/success/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Gig</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order: Order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.gig.title}</TableCell>
              <TableCell>${order.gig.price}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                {order.status === 'pending' && (
                  <Button onClick={() => confirmOrder(order.id)}>Confirm</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}