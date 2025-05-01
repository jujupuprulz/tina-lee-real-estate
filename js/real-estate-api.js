/**
 * Real Estate API Service
 * Uses the USA Real Estate API from RapidAPI
 */

class RealEstateAPI {
    constructor() {
        // RapidAPI configuration
        this.baseUrl = 'https://us-real-estate.p.rapidapi.com';
        this.headers = {
            'X-RapidAPI-Key': '2c0e5c8b3amsh1c9b2e3d9f5e0a9p1e9d54jsn8d5c8a73c0b3', // Free tier API key
            'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
        };
        
        // Cache for API responses to minimize API calls
        this.cache = {
            properties: null,
            propertyDetails: {},
            searchResults: {}
        };
        
        // Default location (Seattle)
        this.defaultLocation = {
            city: 'Seattle',
            state_code: 'WA',
            limit: 10,
            offset: 0
        };
    }
    
    /**
     * Get properties from the API or cache
     * @returns {Promise<Array>} Array of properties
     */
    async getAllProperties() {
        try {
            // Check if we have cached properties
            if (this.cache.properties) {
                return this.cache.properties;
            }
            
            // Prepare the API request
            const params = new URLSearchParams({
                ...this.defaultLocation,
                sort: 'newest'
            });
            
            const url = `${this.baseUrl}/properties/list-for-sale?${params.toString()}`;
            
            // Make the API request
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process and cache the properties
            const properties = this._processProperties(data.properties || []);
            this.cache.properties = properties;
            
            return properties;
        } catch (error) {
            console.error('Error fetching properties:', error);
            
            // Fallback to local data if API fails
            return this._getLocalProperties();
        }
    }
    
    /**
     * Get a property by ID
     * @param {string|number} id Property ID
     * @returns {Promise<Object|null>} Property object or null if not found
     */
    async getPropertyById(id) {
        try {
            // Check if we have this property in cache
            if (this.cache.propertyDetails[id]) {
                return this.cache.propertyDetails[id];
            }
            
            // Get all properties and find the one with matching ID
            const properties = await this.getAllProperties();
            const property = properties.find(p => p.id === parseInt(id));
            
            if (!property) {
                throw new Error(`Property with ID ${id} not found`);
            }
            
            // If we have a property_id, we can fetch more details
            if (property.property_id) {
                try {
                    const url = `${this.baseUrl}/properties/detail?property_id=${property.property_id}`;
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: this.headers
                    });
                    
                    if (response.ok) {
                        const detailData = await response.json();
                        
                        // Merge the detail data with the property
                        if (detailData && detailData.properties && detailData.properties[0]) {
                            const enhancedProperty = {
                                ...property,
                                ...this._processPropertyDetails(detailData.properties[0])
                            };
                            
                            // Cache the enhanced property
                            this.cache.propertyDetails[id] = enhancedProperty;
                            return enhancedProperty;
                        }
                    }
                } catch (detailError) {
                    console.warn('Error fetching property details:', detailError);
                    // Continue with basic property data
                }
            }
            
            // Cache and return the basic property
            this.cache.propertyDetails[id] = property;
            return property;
        } catch (error) {
            console.error(`Error fetching property with ID ${id}:`, error);
            
            // Fallback to local data if API fails
            const localProperties = this._getLocalProperties();
            return localProperties.find(p => p.id === parseInt(id)) || null;
        }
    }
    
    /**
     * Search properties based on criteria
     * @param {Object} criteria Search criteria
     * @returns {Promise<Array>} Filtered properties
     */
    async searchProperties(criteria = {}) {
        try {
            // Create a cache key from the criteria
            const cacheKey = JSON.stringify(criteria);
            
            // Check if we have cached results for these criteria
            if (this.cache.searchResults[cacheKey]) {
                return this.cache.searchResults[cacheKey];
            }
            
            // Prepare API parameters
            const params = new URLSearchParams({
                city: criteria.city || this.defaultLocation.city,
                state_code: criteria.state_code || this.defaultLocation.state_code,
                limit: criteria.limit || this.defaultLocation.limit,
                offset: criteria.offset || this.defaultLocation.offset
            });
            
            // Add optional parameters
            if (criteria.propertyType && criteria.propertyType !== 'all') {
                params.append('prop_type', this._mapPropertyType(criteria.propertyType));
            }
            
            if (criteria.priceRange && criteria.priceRange !== 'all') {
                const [minPrice, maxPrice] = criteria.priceRange.split('-').map(p => parseInt(p));
                if (minPrice) params.append('price_min', minPrice);
                if (maxPrice) params.append('price_max', maxPrice);
            }
            
            if (criteria.minBeds) {
                params.append('beds_min', criteria.minBeds);
            }
            
            if (criteria.minBaths) {
                params.append('baths_min', criteria.minBaths);
            }
            
            // Make the API request
            const url = `${this.baseUrl}/properties/list-for-sale?${params.toString()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process and cache the results
            const properties = this._processProperties(data.properties || []);
            this.cache.searchResults[cacheKey] = properties;
            
            return properties;
        } catch (error) {
            console.error('Error searching properties:', error);
            
            // Fallback to filtering local data if API fails
            const properties = await this._getLocalProperties();
            
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
        }
    }
    
    /**
     * Get featured properties (top 3 most expensive)
     * @returns {Promise<Array>} Featured properties
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
    
    /**
     * Process raw property data from the API
     * @param {Array} rawProperties Raw property data from API
     * @returns {Array} Processed properties
     */
    _processProperties(rawProperties) {
        return rawProperties.map((property, index) => {
            // Generate a unique ID if none exists
            const id = property.property_id || index + 1;
            
            // Extract and format the price
            const price = property.price || 0;
            const priceDisplay = property.price_formatted || `$${price.toLocaleString()}`;
            
            // Determine status
            const status = property.is_for_rent ? 'For Rent' : 'For Sale';
            
            // Extract address components
            const address = {
                streetAddress: property.address?.line || '',
                city: property.address?.city || '',
                state: property.address?.state_code || '',
                zipCode: property.address?.postal_code || '',
                neighborhood: property.address?.neighborhood_name || ''
            };
            
            // Format location
            const location = {
                latitude: property.address?.lat || 0,
                longitude: property.address?.lon || 0
            };
            
            // Extract property details
            const details = {
                bedrooms: property.beds || 0,
                bathrooms: property.baths || 0,
                fullBathrooms: property.baths_full || 0,
                halfBathrooms: property.baths_half || 0,
                squareFeet: property.building_size?.size || 0,
                lotSize: property.lot_size?.size || 0,
                yearBuilt: property.year_built || 0,
                propertyType: property.prop_type || 'Single Family',
                propertySubType: property.sub_type || ''
            };
            
            // Extract features
            const features = property.features?.map(f => f.text) || 
                             property.tags || 
                             ['Modern Design', 'Updated Kitchen', 'Hardwood Floors'];
            
            // Extract description
            const description = property.description || 'Beautiful property in a desirable location.';
            
            // Extract images
            const images = property.photos?.map(photo => photo.href) || 
                          [property.thumbnail || 'images/property1.jpg'];
            
            // Extract agent information
            const listingAgent = {
                name: property.agents?.[0]?.name || 'Tina Lee',
                company: property.office?.name || 'WPI Real Estate Services',
                phone: property.office?.phones?.[0]?.number || '(206) 522-8172',
                email: 'tina.lee@wpirealestate.com'
            };
            
            // Format dates
            const now = new Date();
            const datePosted = property.list_date || now.toISOString();
            const lastUpdated = property.last_update_date || now.toISOString();
            
            // Return the formatted property
            return {
                id,
                property_id: property.property_id,
                mlsId: property.mls?.id || `NWM${Math.floor(1000000 + Math.random() * 9000000)}`,
                status,
                price,
                priceDisplay,
                address,
                location,
                details,
                features,
                description,
                virtualTourUrl: property.virtual_tour?.href || '',
                listingAgent,
                images,
                datePosted,
                lastUpdated
            };
        });
    }
    
    /**
     * Process detailed property data
     * @param {Object} detailData Detailed property data
     * @returns {Object} Processed property details
     */
    _processPropertyDetails(detailData) {
        // Extract additional details that might be available in the detail endpoint
        return {
            description: detailData.description || '',
            features: detailData.features?.map(f => f.text) || [],
            schools: detailData.schools || [],
            taxHistory: detailData.tax_history || [],
            priceHistory: detailData.price_history || []
        };
    }
    
    /**
     * Map property type from the UI to API format
     * @param {string} uiType Property type from UI
     * @returns {string} API property type
     */
    _mapPropertyType(uiType) {
        const typeMap = {
            'house': 'single_family',
            'condo': 'condo',
            'townhouse': 'townhome',
            'multiplex': 'multi_family'
        };
        
        return typeMap[uiType] || 'single_family';
    }
    
    /**
     * Get local property data as fallback
     * @returns {Array} Local property data
     */
    _getLocalProperties() {
        try {
            // Try to load from local storage first
            const cachedData = localStorage.getItem('localProperties');
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            
            // If no cached data, return empty array
            // In a real implementation, we would load from a local JSON file
            return [];
        } catch (error) {
            console.error('Error loading local properties:', error);
            return [];
        }
    }
}

// Create and export a singleton instance
const realEstateAPI = new RealEstateAPI();
