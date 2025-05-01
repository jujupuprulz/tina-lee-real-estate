/**
 * Simulated API service for fetching real estate property data
 * This mimics how a real API would work but uses local JSON data
 */

class PropertyAPI {
    constructor() {
        this.apiUrl = '../data/seattle-properties.json';
    }

    /**
     * Fetch all properties from the API
     * @returns {Promise} Promise that resolves to property data
     */
    async getAllProperties() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.properties;
        } catch (error) {
            console.error('Error fetching properties:', error);
            return [];
        }
    }

    /**
     * Fetch a single property by ID
     * @param {number} id - The property ID
     * @returns {Promise} Promise that resolves to a single property
     */
    async getPropertyById(id) {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const property = data.properties.find(p => p.id === parseInt(id));
            
            if (!property) {
                throw new Error(`Property with ID ${id} not found`);
            }
            
            return property;
        } catch (error) {
            console.error(`Error fetching property with ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Search properties based on criteria
     * @param {Object} criteria - Search criteria
     * @returns {Promise} Promise that resolves to filtered properties
     */
    async searchProperties(criteria = {}) {
        try {
            const properties = await this.getAllProperties();
            
            return properties.filter(property => {
                // Filter by property type
                if (criteria.propertyType && criteria.propertyType !== 'all') {
                    const propertyType = property.details.propertyType.toLowerCase();
                    if (criteria.propertyType === 'house' && propertyType !== 'single family') {
                        return false;
                    } else if (criteria.propertyType === 'condo' && propertyType !== 'condo') {
                        return false;
                    } else if (criteria.propertyType === 'townhouse' && propertyType !== 'townhouse') {
                        return false;
                    } else if (criteria.propertyType === 'multiplex' && propertyType !== 'multiplex') {
                        return false;
                    }
                }
                
                // Filter by location/neighborhood
                if (criteria.location && criteria.location !== 'all') {
                    const city = property.address.city.toLowerCase();
                    const neighborhood = property.address.neighborhood.toLowerCase();
                    
                    if (criteria.location === 'seattle' && city.toLowerCase() !== 'seattle') {
                        return false;
                    } else if (criteria.location === 'bellevue' && city.toLowerCase() !== 'bellevue') {
                        return false;
                    } else if (criteria.location === 'kirkland' && city.toLowerCase() !== 'kirkland') {
                        return false;
                    } else if (criteria.location === 'redmond' && city.toLowerCase() !== 'redmond') {
                        return false;
                    } else if (criteria.location === 'mercer-island' && neighborhood.toLowerCase() !== 'mercer island') {
                        return false;
                    }
                }
                
                // Filter by price range
                if (criteria.priceRange && criteria.priceRange !== 'all') {
                    const [minPrice, maxPrice] = criteria.priceRange.split('-').map(p => parseInt(p));
                    
                    if (minPrice && property.price < minPrice) {
                        return false;
                    }
                    
                    if (maxPrice && property.price > maxPrice) {
                        return false;
                    }
                }
                
                // Filter by status (For Sale, For Rent)
                if (criteria.status && property.status !== criteria.status) {
                    return false;
                }
                
                // Filter by minimum bedrooms
                if (criteria.minBeds && property.details.bedrooms < criteria.minBeds) {
                    return false;
                }
                
                // Filter by minimum bathrooms
                if (criteria.minBaths && property.details.bathrooms < criteria.minBaths) {
                    return false;
                }
                
                return true;
            });
        } catch (error) {
            console.error('Error searching properties:', error);
            return [];
        }
    }

    /**
     * Get featured properties (top 3 most expensive)
     * @returns {Promise} Promise that resolves to featured properties
     */
    async getFeaturedProperties() {
        try {
            const properties = await this.getAllProperties();
            // Sort by price (descending) and take the top 3
            return properties
                .sort((a, b) => b.price - a.price)
                .slice(0, 3);
        } catch (error) {
            console.error('Error fetching featured properties:', error);
            return [];
        }
    }
}

// Create and export a singleton instance
const propertyAPI = new PropertyAPI();
