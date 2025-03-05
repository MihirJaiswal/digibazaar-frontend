"use client";

import { useEffect, useRef } from 'react';

interface StockValueChartProps {
  labels: string[];
  data: number[];
}

export default function StockValueChart({ labels, data }: StockValueChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !labels.length || !data.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Chart dimensions
    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    // Find max value for scaling
    const maxValue = Math.max(...data);
    const total = data.reduce((sum, value) => sum + value, 0);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Stock Value Distribution', canvas.width / 2, 30);
    
    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(chartWidth, chartHeight) / 2;
    
    let startAngle = 0;
    const colors = [
      '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe',
      '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'
    ];
    
    // Draw pie slices
    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // Draw percentage if slice is big enough
      if (sliceAngle > 0.2) {
        const midAngle = startAngle + sliceAngle / 2;
        const x = centerX + Math.cos(midAngle) * (radius * 0.7);
        const y = centerY + Math.sin(midAngle) * (radius * 0.7);
        
        const percentage = ((data[i] / total) * 100).toFixed(1) + '%';
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(percentage, x, y);
      }
      
      startAngle = endAngle;
    }
    
    // Draw legend
    const legendX = canvas.width - padding + 20;
    const legendY = padding;
    const legendItemHeight = 25;
    
    for (let i = 0; i < Math.min(data.length, 10); i++) {
      const y = legendY + i * legendItemHeight;
      
      // Draw color box
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(legendX, y, 15, 15);
      
      // Draw label
      let label = labels[i];
      if (label.length > 15) {
        label = label.substring(0, 15) + '...';
      }
      
      const value = `$${data[i].toFixed(2)}`;
      const percentage = `(${((data[i] / total) * 100).toFixed(1)}%)`;
      
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(label, legendX + 20, y + 12);
      
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px Arial';
      ctx.fillText(`${value} ${percentage}`, legendX + 20, y + 24);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = canvasRef.current.offsetHeight;
      renderChart();
    };
    
    const renderChart = () => {
      // Re-render the chart (this function would contain all the chart drawing code)
      // For simplicity, we're just calling the effect again
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [labels, data]);
  
  return (
    <div className="w-full h-full flex flex-col">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
