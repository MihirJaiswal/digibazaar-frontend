"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";

// Dynamically import the chart component to avoid SSR issues
const StockChart = dynamic(() => import("@/components/inventory/stock-chart"), { ssr: false });

interface Movement {
  id: string;
  productId: string;
  changeType: "INCOMING" | "OUTGOING";
  quantity: number;
  reason?: string;
  warehouseName?: string;
  createdAt: string;
  createdBy?: string;
}

interface StockMovementsProps {
  productId: string;
}

const StockMovementsTable = ({ productId }: StockMovementsProps) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    netChange: 0,
    lastWeekChange: 0
  });

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/stock/movements/${productId}`);
        const data = await res.json();
        setMovements(data);
        
        // Calculate statistics
        const totalIn = data.reduce((sum: number, m: Movement) => 
          m.changeType === "INCOMING" ? sum + m.quantity : sum, 0);
        
        const totalOut = data.reduce((sum: number, m: Movement) => 
          m.changeType === "OUTGOING" ? sum + m.quantity : sum, 0);
        
        // Calculate last week's changes
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const lastWeekMovements = data.filter((m: Movement) => 
          new Date(m.createdAt) >= oneWeekAgo);
        
        const lastWeekIn = lastWeekMovements.reduce((sum: number, m: Movement) => 
          m.changeType === "INCOMING" ? sum + m.quantity : sum, 0);
        
        const lastWeekOut = lastWeekMovements.reduce((sum: number, m: Movement) => 
          m.changeType === "OUTGOING" ? sum + m.quantity : sum, 0);
        
        setStats({
          totalIn,
          totalOut,
          netChange: totalIn - totalOut,
          lastWeekChange: lastWeekIn - lastWeekOut
        });
      } catch (error) {
        console.error("Error fetching stock movements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, [productId]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!movements.length) return { dates: [], quantities: [] };
    
    // Sort movements by date
    const sortedMovements = [...movements].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Get unique dates
    const uniqueDates = Array.from(new Set(
      sortedMovements.map(m => new Date(m.createdAt).toLocaleDateString())
    ));
    
    // Calculate cumulative quantity for each date
    let runningTotal = 0;
    const quantities = uniqueDates.map(date => {
      const dayMovements = sortedMovements.filter(m => 
        new Date(m.createdAt).toLocaleDateString() === date
      );
      
      dayMovements.forEach(m => {
        if (m.changeType === "INCOMING") {
          runningTotal += m.quantity;
        } else {
          runningTotal -= m.quantity;
        }
      });
      
      return runningTotal;
    });
    
    return { dates: uniqueDates, quantities };
  };

  const chartData = prepareChartData();

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-5 w-5 text-primary" />
          Stock Movement Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Movement History</TabsTrigger>
            <TabsTrigger value="chart">Trend Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total In</p>
                      <p className="text-2xl font-bold text-green-600">{stats.totalIn}</p>
                    </div>
                    <ArrowUpRight className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Out</p>
                      <p className="text-2xl font-bold text-red-600">{stats.totalOut}</p>
                    </div>
                    <ArrowDownRight className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Change</p>
                      <p className={`text-2xl font-bold ${stats.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.netChange}
                      </p>
                    </div>
                    {stats.netChange >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Last 7 Days</p>
                      <p className={`text-2xl font-bold ${stats.lastWeekChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.lastWeekChange}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {movements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Recent Movements</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.slice(0, 5).map((movement, index) => (
                      <TableRow key={movement.id || index}>
                        <TableCell>
                          {new Date(movement.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={movement.changeType === "INCOMING" ? "outline" : "secondary"}
                            className={`${
                              movement.changeType === "INCOMING" 
                                ? "border-green-500 text-green-600 bg-green-50" 
                                : "border-red-500 text-red-600 bg-red-50"
                            }`}
                          >
                            {movement.changeType === "INCOMING" ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {movement.changeType}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-medium ${
                          movement.changeType === "INCOMING" ? "text-green-600" : "text-red-600"
                        }`}>
                          {movement.changeType === "INCOMING" ? "+" : "-"}{movement.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-muted-foreground">Loading stock movements...</p>
                </div>
              </div>
            ) : movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No stock movements found for this product</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Created By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement, index) => (
                    <TableRow key={movement.id || index}>
                      <TableCell>
                        {new Date(movement.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={movement.changeType === "INCOMING" ? "outline" : "secondary"}
                          className={`${
                            movement.changeType === "INCOMING" 
                              ? "border-green-500 text-green-600 bg-green-50" 
                              : "border-red-500 text-red-600 bg-red-50"
                          }`}
                        >
                          {movement.changeType === "INCOMING" ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {movement.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-medium ${
                        movement.changeType === "INCOMING" ? "text-green-600" : "text-red-600"
                      }`}>
                        {movement.changeType === "INCOMING" ? "+" : "-"}{movement.quantity}
                      </TableCell>
                      <TableCell>{movement.warehouseName || "N/A"}</TableCell>
                      <TableCell>{movement.reason || "N/A"}</TableCell>
                      <TableCell>{movement.createdBy || "System"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="chart" className="pt-4">
            <div className="h-[300px]">
              {movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>No data available for chart visualization</p>
                </div>
              ) : (
                <StockChart 
                  dates={chartData.dates} 
                  quantities={chartData.quantities} 
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StockMovementsTable;
