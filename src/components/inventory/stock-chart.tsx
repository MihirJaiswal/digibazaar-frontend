"use client";

import { useEffect, useRef } from 'react';

interface StockChartProps {
  dates: string[];
  quantities: number[];
}

export default function StockChart({ dates, quantities }: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const renderChart = () => {
    if (!canvasRef.current || !dates.length || !quantities.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    // Find min and max values
    const minQuantity = Math.min(0, ...quantities);
    const maxQuantity = Math.max(...quantities);
    const range = maxQuantity - minQuantity;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw grid lines
    const gridLines = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i;
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      // Y-axis labels
      const value = maxQuantity - (range / gridLines) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), padding - 5, y + 3);
    }
    
    // X-axis labels (show only some dates to avoid overcrowding)
    const labelStep = Math.max(1, Math.floor(dates.length / 5));
    
    for (let i = 0; i < dates.length; i += labelStep) {
      const x = padding + (chartWidth / (dates.length - 1)) * i;
      
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - padding);
      ctx.lineTo(x, canvas.height - padding + 5);
      ctx.stroke();
      
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dates[i], x, canvas.height - padding + 15);
    }
    
    // Draw line chart
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < dates.length; i++) {
      const x = padding + (chartWidth / (dates.length - 1)) * i;
      const y = padding + chartHeight - ((quantities[i] - minQuantity) / range) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw points
    for (let i = 0; i < dates.length; i++) {
      const x = padding + (chartWidth / (dates.length - 1)) * i;
      const y = padding + chartHeight - ((quantities[i] - minQuantity) / range) * chartHeight;
      
      ctx.fillStyle = quantities[i] >= 0 ? '#3b82f6' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Stock Level Trend', canvas.width / 2, 20);
  };

  useEffect(() => {
    renderChart();
    
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = canvasRef.current.offsetHeight;
      renderChart();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dates, quantities]);
  
  return (
    <div className="w-full h-full flex flex-col">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
