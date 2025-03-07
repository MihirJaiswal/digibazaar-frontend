// src/lib/store-service.ts

interface Product {
    id: string;
    name: string;
    price: string;
    image?: string;
    description?: string;
  }
  
  export interface Store {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    logo?: string;
    featuredProducts?: Product[];
    theme?: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
    };
    owner: {
      id: string;
      name: string;
    };
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    category: string;
    template: string;
    language: string;
    currency: string;
    timezone: string;
    enableBlog: boolean;
    enableReviews: boolean;
    shippingRegions: string[];
    taxSettings: string;
  }
  
  /**
   * Fetch products from the API.
   */
  export async function getProducts(token: string | null): Promise<Product[]> {
    try {
      const response = await fetch("http://localhost:8800/api/products", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      const products: Product[] = await response.json();
      return products;
    } catch (error) {
      console.error("Failed to fetch products", error);
      return [];
    }
  }
  
  /**
   * Fetch stores from the primary API endpoint.
   */
  export async function getStores(token: string | null): Promise<Store[]> {
    try {
      const response = await fetch("http://localhost:8800/api/stores", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching stores: ${response.statusText}`);
      }
      const stores: Store[] = await response.json();
      return stores;
    } catch (error) {
      console.error("Failed to fetch stores", error);
      return [];
    }
  }
  
  /**
   * Fetch all stores from the /all endpoint.
   */
  export async function getAllStores(token: string | null): Promise<Store[]> {
    try {
      const response = await fetch("http://localhost:8800/api/stores/all", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching all stores: ${response.statusText}`);
      }
      const stores: Store[] = await response.json();
      return stores;
    } catch (error) {
      console.error("Failed to fetch all stores", error);
      return [];
    }
  }
  
  /**
   * Optionally, filter only published stores.
   */
