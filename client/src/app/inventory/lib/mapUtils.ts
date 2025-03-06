export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  
  // Find the nearest warehouse based on user's shipping address
  export const findNearestWarehouse = <T extends { coordinates: { latitude: number; longitude: number } }>(
    userLat: number | null, 
    userLon: number | null, 
    warehouses: T[]
  ): (T & { distance: number }) | null => {
    // If user coordinates are not available, return the first warehouse or null
    if (userLat === null || userLon === null) {
      if (warehouses.length > 0) {
        const firstWarehouse = warehouses[0];
        return {
          ...firstWarehouse,
          distance: 0 // Default distance
        };
      }
      return null;
    }
  
    let nearestWarehouse = null;
    let minDistance = Infinity;
  
    warehouses.forEach((warehouse) => {
      const distance = calculateDistance(
        userLat, 
        userLon, 
        warehouse.coordinates.latitude, 
        warehouse.coordinates.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestWarehouse = { 
          ...warehouse, 
          distance 
        };
      }
    });
  
    return nearestWarehouse;
  };