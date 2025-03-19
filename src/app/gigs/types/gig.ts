export interface User {
    id: string
    email: string
    username: string
    profilePic: string
    bio: string
    country: string
    phone: string
    walletBalance: number
    badges: string[] | null
    socialLinks: any | null
    createdAt: string
    updatedAt: string
    isSeller: boolean
  }
  
  export interface Review {
    id: string
    userId: string
    gigId: string
    rating: number
    comment: string
    createdAt: string
    user: {
      username: string
      profilePic: string
    }
  }
  
  export interface Gig {
    id: string;
    userId: string;
    title: string;
    description: string;
    bulkPrice: number; // Price per unit in bulk
    cover: string; // Cover image URL
    images: string[]; // Array of image URLs
    minOrderQty: number; // Minimum Order Quantity
    leadTime: number; // Estimated fulfillment time (in days)
    available: boolean; // Whether the product is available
    supplyCapacity?: number; // Optional: Max production/supply capacity per month
    features: Record<string, any>; // Features stored as JSON (e.g., colors, sizes)
    createdAt: string;
    updatedAt: string;

  }
  

  
  