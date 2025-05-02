/**
 * Real Estate API Service
 * Uses the USA Real Estate API from RapidAPI
 */

class RealEstateAPI {
    constructor() {
        // RapidAPI configuration
        this.baseUrl = 'https://us-real-estate.p.rapidapi.com';
        this.headers = {
            'X-RapidAPI-Key': 'a8f3f3f8a0msh3a8c1c9a1c8b9c1p1c8c7fjsn3a8c1c9a1c8b', // Updated free tier API key
            'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
        };

        // Cache for API responses to minimize API calls
        this.cache = {
            properties: null,
            propertyDetails: {},
            searchResults: {}
        };

        // Default location (Seattle and Bellevue area)
        this.defaultLocation = {
            city: 'Seattle',
            state_code: 'WA',
            limit: 12,
            offset: 0,
            radius: 20 // 20 mile radius to include Bellevue and surrounding areas
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
                offset: criteria.offset || this.defaultLocation.offset,
                radius: criteria.radius || this.defaultLocation.radius,
                sort: criteria.sort || 'newest'
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

            // If no cached data, return demo properties for Seattle area
            return this._getSeattleAreaProperties();
        } catch (error) {
            console.error('Error loading local properties:', error);
            return this._getSeattleAreaProperties();
        }
    }

    /**
     * Get demo properties for Seattle area
     * @returns {Array} Demo properties
     */
    _getSeattleAreaProperties() {
        // Create demo properties for Seattle and Bellevue area
        return [
            {
                id: 1001,
                property_id: 'demo1001',
                mlsId: 'NWM1234567',
                status: 'For Sale',
                price: 1250000,
                priceDisplay: '$1,250,000',
                address: {
                    streetAddress: '123 Lakefront Drive',
                    city: 'Seattle',
                    state: 'WA',
                    zipCode: '98101',
                    neighborhood: 'Downtown'
                },
                location: {
                    latitude: 47.6062,
                    longitude: -122.3321
                },
                details: {
                    bedrooms: 3,
                    bathrooms: 2.5,
                    fullBathrooms: 2,
                    halfBathrooms: 1,
                    squareFeet: 2200,
                    lotSize: 4500,
                    yearBuilt: 2015,
                    propertyType: 'Single Family',
                    propertySubType: 'Detached'
                },
                features: [
                    'Hardwood Floors',
                    'Stainless Steel Appliances',
                    'Quartz Countertops',
                    'Open Floor Plan',
                    'Rooftop Deck',
                    'City Views'
                ],
                description: 'Stunning modern home in the heart of Seattle with breathtaking city views. This 3-bedroom, 2.5-bath residence features an open floor plan, gourmet kitchen with high-end appliances, and a spectacular rooftop deck perfect for entertaining.',
                images: [
                    'images/property1.jpg',
                    'images/property1-2.jpg',
                    'images/property1-3.jpg'
                ],
                listingAgent: {
                    name: 'Tina Lee',
                    company: 'WPI Real Estate Services',
                    phone: '(206) 522-8172',
                    email: 'tina.lee@wpirealestate.com'
                },
                datePosted: '2025-01-15T00:00:00.000Z',
                lastUpdated: '2025-04-01T00:00:00.000Z'
            },
            {
                id: 1002,
                property_id: 'demo1002',
                mlsId: 'NWM7654321',
                status: 'For Sale',
                price: 1850000,
                priceDisplay: '$1,850,000',
                address: {
                    streetAddress: '456 Evergreen Terrace',
                    city: 'Bellevue',
                    state: 'WA',
                    zipCode: '98004',
                    neighborhood: 'Medina'
                },
                location: {
                    latitude: 47.6101,
                    longitude: -122.2015
                },
                details: {
                    bedrooms: 4,
                    bathrooms: 3.5,
                    fullBathrooms: 3,
                    halfBathrooms: 1,
                    squareFeet: 3600,
                    lotSize: 8500,
                    yearBuilt: 2018,
                    propertyType: 'Single Family',
                    propertySubType: 'Detached'
                },
                features: [
                    'Smart Home Technology',
                    'Chef\'s Kitchen',
                    'Home Theater',
                    'Wine Cellar',
                    'Heated Floors',
                    'Lake Views'
                ],
                description: 'Luxurious Bellevue residence with stunning lake views. This 4-bedroom, 3.5-bath home offers the perfect blend of elegance and comfort with high-end finishes throughout. Features include a gourmet kitchen, home theater, wine cellar, and smart home technology.',
                images: [
                    'images/property2.jpg',
                    'images/property2-2.jpg',
                    'images/property2-3.jpg'
                ],
                listingAgent: {
                    name: 'Tina Lee',
                    company: 'WPI Real Estate Services',
                    phone: '(206) 522-8172',
                    email: 'tina.lee@wpirealestate.com'
                },
                datePosted: '2025-02-10T00:00:00.000Z',
                lastUpdated: '2025-04-05T00:00:00.000Z'
            },
            {
                id: 1003,
                property_id: 'demo1003',
                mlsId: 'NWM9876543',
                status: 'For Sale',
                price: 950000,
                priceDisplay: '$950,000',
                address: {
                    streetAddress: '789 Downtown Avenue',
                    city: 'Seattle',
                    state: 'WA',
                    zipCode: '98104',
                    neighborhood: 'Pioneer Square'
                },
                location: {
                    latitude: 47.6016,
                    longitude: -122.3319
                },
                details: {
                    bedrooms: 2,
                    bathrooms: 2,
                    fullBathrooms: 2,
                    halfBathrooms: 0,
                    squareFeet: 1500,
                    lotSize: 0,
                    yearBuilt: 2020,
                    propertyType: 'Condo',
                    propertySubType: 'High-Rise'
                },
                features: [
                    'Floor-to-Ceiling Windows',
                    'Concierge Service',
                    'Fitness Center',
                    'Rooftop Lounge',
                    'Pet Friendly',
                    'Walk Score: 98'
                ],
                description: 'Modern luxury condo in the heart of downtown Seattle. This 2-bedroom, 2-bath unit features floor-to-ceiling windows with spectacular city views, high-end finishes, and building amenities including concierge service, fitness center, and rooftop lounge.',
                images: [
                    'images/property3.jpg',
                    'images/property3-2.jpg',
                    'images/property3-3.jpg'
                ],
                listingAgent: {
                    name: 'Tina Lee',
                    company: 'WPI Real Estate Services',
                    phone: '(206) 522-8172',
                    email: 'tina.lee@wpirealestate.com'
                },
                datePosted: '2025-03-01T00:00:00.000Z',
                lastUpdated: '2025-04-10T00:00:00.000Z'
            },
            {
                id: 1004,
                property_id: 'demo1004',
                mlsId: 'NWM2468135',
                status: 'For Sale',
                price: 1450000,
                priceDisplay: '$1,450,000',
                address: {
                    streetAddress: '101 Waterfront Way',
                    city: 'Kirkland',
                    state: 'WA',
                    zipCode: '98033',
                    neighborhood: 'Juanita'
                },
                location: {
                    latitude: 47.6727,
                    longitude: -122.2082
                },
                details: {
                    bedrooms: 3,
                    bathrooms: 2.5,
                    fullBathrooms: 2,
                    halfBathrooms: 1,
                    squareFeet: 2200,
                    lotSize: 3500,
                    yearBuilt: 2019,
                    propertyType: 'Townhouse',
                    propertySubType: 'Attached'
                },
                features: [
                    'Waterfront Access',
                    'Private Dock',
                    'Gourmet Kitchen',
                    'Outdoor Living Space',
                    'Two-Car Garage',
                    'Lake Views'
                ],
                description: 'Stunning waterfront townhome in Kirkland with private dock access. This 3-bedroom, 2.5-bath residence offers luxurious living with high-end finishes, a gourmet kitchen, spacious outdoor living areas, and breathtaking lake views.',
                images: [
                    'images/property4.jpg',
                    'images/property4-2.jpg',
                    'images/property4-3.jpg'
                ],
                listingAgent: {
                    name: 'Tina Lee',
                    company: 'WPI Real Estate Services',
                    phone: '(206) 522-8172',
                    email: 'tina.lee@wpirealestate.com'
                },
                datePosted: '2025-02-15T00:00:00.000Z',
                lastUpdated: '2025-04-12T00:00:00.000Z'
            },
            {
                id: 1005,
                property_id: 'demo1005',
                mlsId: 'NWM1357924',
                status: 'For Sale',
                price: 1350000,
                priceDisplay: '$1,350,000',
                address: {
                    streetAddress: '222 Hillside Lane',
                    city: 'Redmond',
                    state: 'WA',
                    zipCode: '98052',
                    neighborhood: 'Education Hill'
                },
                location: {
                    latitude: 47.6740,
                    longitude: -122.1215
                },
                details: {
                    bedrooms: 4,
                    bathrooms: 3,
                    fullBathrooms: 3,
                    halfBathrooms: 0,
                    squareFeet: 2700,
                    lotSize: 7500,
                    yearBuilt: 2017,
                    propertyType: 'Single Family',
                    propertySubType: 'Detached'
                },
                features: [
                    'Bonus Room',
                    'Home Office',
                    'Fenced Backyard',
                    'Covered Patio',
                    'Energy Efficient',
                    'Mountain Views'
                ],
                description: 'Beautiful family home in desirable Education Hill neighborhood. This 4-bedroom, 3-bath residence features an open floor plan, gourmet kitchen, dedicated home office, bonus room, and a spacious backyard with covered patio perfect for entertaining.',
                images: [
                    'images/property5.jpg',
                    'images/property5-2.jpg',
                    'images/property5-3.jpg'
                ],
                listingAgent: {
                    name: 'Tina Lee',
                    company: 'WPI Real Estate Services',
                    phone: '(206) 522-8172',
                    email: 'tina.lee@wpirealestate.com'
                },
                datePosted: '2025-03-10T00:00:00.000Z',
                lastUpdated: '2025-04-15T00:00:00.000Z'
            },
            {
                id: 1006,
                property_id: 'demo1006',
                mlsId: 'NWM8642097',
                status: 'For Sale',
                price: 1650000,
                priceDisplay: '$1,650,000',
                address: {
                    streetAddress: '333 Lakeview Circle',
                    city: 'Sammamish',
                    state: 'WA',
                    zipCode: '98074',
                    neighborhood: 'Sahalee'
                },
                location: {
                    latitude: 47.6162,
                    longitude: -122.0355
                },
                details: {
                    bedrooms: 5,
                    bathrooms: 3.5,
                    fullBathrooms: 3,
                    halfBathrooms: 1,
                    squareFeet: 3200,
                    lotSize: 12000,
                    yearBuilt: 2016,
                    propertyType: 'Single Family',
                    propertySubType: 'Detached'
                },
                features: [
                    'Gourmet Kitchen',
                    'Primary Suite with Spa Bath',
                    'Media Room',
                    'Three-Car Garage',
                    'Landscaped Yard',
                    'Lake Views'
                ],
                description: 'Exquisite Sammamish residence with stunning lake views. This 5-bedroom, 3.5-bath home offers luxurious living with high-end finishes throughout. Features include a gourmet kitchen, spa-like primary suite, media room, three-car garage, and beautifully landscaped yard.',
                images: [
                    'images/property6.jpg',
                    'images/property6-2.jpg',
                    'images/property6-3.jpg'
                ],
                listingAgent: {
                    name: 'Tina Lee',
                    company: 'WPI Real Estate Services',
                    phone: '(206) 522-8172',
                    email: 'tina.lee@wpirealestate.com'
                },
                datePosted: '2025-01-20T00:00:00.000Z',
                lastUpdated: '2025-04-18T00:00:00.000Z'
            }
        ];
    }
}

// Create and export a singleton instance
const realEstateAPI = new RealEstateAPI();
