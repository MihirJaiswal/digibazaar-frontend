export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  export const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      ACCEPTED: "bg-blue-500",
      PENDING: "bg-amber-500",
      PROCESSING: "bg-purple-500",
      SHIPPED: "bg-indigo-500",
      DELIVERED: "bg-green-500",
      CANCELLED: "bg-red-500",
    };
    
    return statusColors[status] || "bg-gray-500";
  };
  