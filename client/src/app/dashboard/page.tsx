'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface DashboardData {
  orders: number;
  gigs: number;
  unreadMessages: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  revenue: number;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

 const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem("token"); // ✅ Get token from localStorage
    if (!token) throw new Error("No token found. Please log in.");

    const res = await fetch("http://localhost:3001/api/dashboard/seller", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Send token in Authorization header
        "Content-Type": "application/json",
      },
      credentials: "include", // Optional: Only if using cookies too
    });

    if (!res.ok) throw new Error("Unauthorized request");

    const data = await res.json();
    console.log("Dashboard Data:", data);
  } catch (err) {
    console.error("Error fetching dashboard data:", err.message);
  }
};

  

  if (loading) {
    return <div className="text-center text-lg font-semibold">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[ 
          { title: 'Annual Revenue', value: dashboardData?.revenue },
          { title: 'Monthly Revenue', value: dashboardData?.monthlyRevenue },
          { title: 'Daily Revenue', value: dashboardData?.dailyRevenue },
          { title: 'Total Orders', value: dashboardData?.orders },
          { title: 'Active Gigs', value: dashboardData?.gigs },
          { title: 'Unread Messages', value: dashboardData?.unreadMessages }
        ].map(({ title, value }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value !== undefined ? value.toLocaleString() : '0'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
