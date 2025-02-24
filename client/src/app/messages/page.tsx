'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  type Message = {
    id: string;
    sender: string;
    content: string;
  };

  useEffect(() => {
    if (selectedOrder) {
      fetchMessages(selectedOrder);
    }
  }, [selectedOrder]);

  const fetchMessages = async (orderId: string) => {
    try {
      const response = await api.get(`/messages/get-messages/${orderId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    try {
      await api.post(`/messages/add-message/${selectedOrder}`, { content: newMessage });
      setNewMessage('');
      fetchMessages(selectedOrder);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      <div className="flex">
        <div className="w-1/3 pr-4">
          <h2 className="text-xl font-bold mb-4">Orders</h2>
          {/* Add a list of orders here */}
        </div>
        <div className="w-2/3">
          <Card>
            <CardContent className="p-4">
              <div className="h-96 overflow-y-auto mb-4">
                {messages.map((message: Message) => (
                  <div key={message.id} className="mb-2">
                    <strong>{message.sender}:</strong> {message.content}
                  </div>
                ))}
              </div>
              <div className="flex">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow mr-2"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}