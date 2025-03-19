"use client";

import { useEffect, useRef } from 'react';

interface WarehouseCapacityChartProps {
  usedCapacity: number;
  totalCapacity: number;
}

export default function WarehouseCapacityChart({ usedCapacity, totalCapacity }: WarehouseCapacityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Calculate percentages
    const usedPercentage = (usedCapacity / totalCapacity) * 100;
    const availablePercentage = 100 - usedPercentage;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chart dimensions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const lineWidth = 30;
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Draw used capacity arc
    const startAngle = -0.5 * Math.PI; // Start at top
    const endAngle = startAngle + (usedPercentage / 100) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    
    // Create gradient for used capacity
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#60a5fa');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Draw center text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(usedPercentage)}%`, centerX, centerY - 15);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial';
    ctx.fillText('Used', centerX, centerY + 15);
    
    // Draw legend
    const legendY = canvas.height - 40;
    
    // Used capacity
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(centerX - 100, legendY, 15, 15);
    
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Used: ${usedCapacity} (${Math.round(usedPercentage)}%)`, centerX - 80, legendY + 12);
    
    // Available capacity
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(centerX + 20, legendY, 15, 15);
    
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`Available: ${totalCapacity - usedCapacity} (${Math.round(availablePercentage)}%)`, centerX + 40, legendY + 12);
    
    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = canvasRef.current.offsetHeight;
      renderChart();
    };
    
    const renderChart = () => {
      // Re-render the chart
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
  }, [usedCapacity, totalCapacity]);
  
  return (
    <div className="w-full h-full flex flex-col">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
