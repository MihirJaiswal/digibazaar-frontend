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
    id: string
    userId: string
    category: string
    title: string
    desc: string
    totalStars: number
    starNumber: number
    price: number
    cover: string
    images: string[]
    shortDesc: string
    deliveryTime: number
    revisionNumber: number
    resume: string
    yearsOfExp: number
    features: string[]
    sales: number
    likes?: number
    createdAt: string
    updatedAt: string
    user: User
    reviews?: Review[]
    isLiked?: boolean
  }
  
  