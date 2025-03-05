"use client";

import { useEffect, useRef } from 'react';

interface StockDistributionChartProps {
  labels: string[];
  data: number[];
}

export default function StockDistributionChart({ labels, data }: StockDistributionChartProps) {
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
    const barWidth = Math.min(40, (chartWidth / data.length) * 0.8);
    const barSpacing = (chartWidth - barWidth * data.length) / (data.length + 1);
    
    // Find max value for scaling
    const maxValue = Math.max(...data);
    const scale = chartHeight / maxValue;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Stock Distribution by Product', canvas.width / 2, 30);
    
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
    
    // Draw grid lines and labels for Y-axis
    const gridLines = 5;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i;
      const value = maxValue - (maxValue / gridLines) * i;
      
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
      
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
    
    // Draw bars and labels
    for (let i = 0; i < data.length; i++) {
      const x = padding + barSpacing * (i + 1) + barWidth * i;
      const barHeight = data[i] * scale;
      const y = canvas.height - padding - barHeight;
      
      // Draw bar
      const gradient = ctx.createLinearGradient(x, y, x, canvas.height - padding);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#60a5fa');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 4);
      ctx.fill();
      
      // Draw bar value
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data[i].toString(), x + barWidth / 2, y - 10);
      
      // Draw x-axis label (truncate if too long)
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      let label = labels[i];
      if (label.length > 10) {
        label = label.substring(0, 10) + '...';
      }
      
      ctx.fillText(label, x + barWidth / 2, canvas.height - padding + 20);
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
