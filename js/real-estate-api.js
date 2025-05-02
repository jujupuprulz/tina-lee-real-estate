/**
 * Real Estate API Service
 * Uses the USA Real Estate API from RapidAPI
 */

class RealEstateAPI {
    constructor() {
        // RapidAPI configuration
        this.baseUrl = 'https://zillow-com1.p.rapidapi.com';
        this.headers = {
            'X-RapidAPI-Key': '9f2d7adc44msh916072e3e3d9022p1f5a6djsn3c9e9ef7e2e8', // New API key with higher quota
            'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
        };

        // Cache for API responses to minimize API calls
        this.cache = {
            properties: null,
            propertyDetails: {},
            searchResults: {}
        };

        // Default location (Seattle and Bellevue area)
        this.defaultLocation = {
            location: 'Seattle, WA',
            page: 1,
            home_type: 'Houses,Condos,Apartments,Townhomes',
            price_min: 500000,
            price_max: 3000000,
            beds_min: 2,
            baths_min: 2,
            sort: 'Homes For You'
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
            const params = new URLSearchParams();

            // Add all parameters from defaultLocation
            Object.entries(this.defaultLocation).forEach(([key, value]) => {
                params.append(key, value);
            });

            // Ensure we have the sort parameter
            if (!params.has('sort')) {
                params.append('sort', 'newest');
            }

            const url = `${this.baseUrl}/propertyExtendedSearch?${params.toString()}`;

            console.log('Fetching properties from API:', url);

            // Make the API request
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                console.error(`API error: ${response.status}`);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            console.log('API response:', data);

            // Log detailed information about the images in the response
            if (data && data.properties && data.properties.length > 0) {
                console.log('First property images:', data.properties[0].photos || data.properties[0].thumbnail || 'No images found');
                console.log('First property full data:', data.properties[0]);
            } else if (data && data.home_search && data.home_search.results && data.home_search.results.length > 0) {
                console.log('First property images:', data.home_search.results[0].photos || data.home_search.results[0].thumbnail || 'No images found');
                console.log('First property full data:', data.home_search.results[0]);
            } else if (data && data.data && data.data.length > 0) {
                console.log('First property images:', data.data[0].photos || data.data[0].thumbnail || 'No images found');
                console.log('First property full data:', data.data[0]);
            } else if (data && data.results && data.results.length > 0) {
                console.log('First property images:', data.results[0].photos || data.results[0].thumbnail || 'No images found');
                console.log('First property full data:', data.results[0]);
            }

            // Check if we have properties in the response
            if (!data || (!data.properties && !data.home_search && !data.results && !data.data)) {
                console.warn('No properties found in API response:', data);
                return this._getLocalProperties();
            }

            // Process and cache the properties
            const properties = this._processProperties(data);

            // If we got no properties from the API, use local properties
            if (!properties || properties.length === 0) {
                console.warn('No properties returned after processing API response');
                return this._getLocalProperties();
            }

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
            const params = new URLSearchParams();

            // Set location based on criteria or default
            let location = this.defaultLocation.location;
            if (criteria.location && criteria.location !== 'all') {
                location = `${criteria.location}, WA`;
            } else if (criteria.city) {
                location = `${criteria.city}, WA`;
            }
            params.append('location', location);

            // Set page
            params.append('page', criteria.page || '1');

            // Set home type based on property type
            let homeType = this.defaultLocation.home_type;
            if (criteria.propertyType && criteria.propertyType !== 'all') {
                homeType = this._mapPropertyType(criteria.propertyType);
            }
            params.append('home_type', homeType);

            // Add price range
            if (criteria.priceRange && criteria.priceRange !== 'all') {
                const [minPrice, maxPrice] = criteria.priceRange.split('-').map(p => parseInt(p));
                if (minPrice) params.append('price_min', minPrice);
                if (maxPrice) params.append('price_max', maxPrice);
            } else {
                // Add default price range
                params.append('price_min', this.defaultLocation.price_min);
                params.append('price_max', this.defaultLocation.price_max);
            }

            // Add beds and baths
            if (criteria.minBeds && criteria.minBeds !== 'any') {
                params.append('beds_min', criteria.minBeds);
            } else {
                params.append('beds_min', this.defaultLocation.beds_min);
            }

            if (criteria.minBaths && criteria.minBaths !== 'any') {
                params.append('baths_min', criteria.minBaths);
            } else {
                params.append('baths_min', this.defaultLocation.baths_min);
            }

            // Set sort
            params.append('sort', this.defaultLocation.sort);

            // Make the API request
            const url = `${this.baseUrl}/propertyExtendedSearch?${params.toString()}`;

            console.log('Searching properties with API:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                console.error(`API error: ${response.status}`);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            console.log('Search API response:', data);

            // Check if we have properties in the response
            if (!data || (!data.properties && !data.home_search && !data.results && !data.data)) {
                console.warn('No properties found in search API response:', data);
                return this._filterLocalProperties(criteria);
            }

            // Process and cache the results
            const properties = this._processProperties(data);

            // If we got no properties from the API, filter local properties
            if (!properties || properties.length === 0) {
                console.warn('No properties returned after processing search API response');
                return this._filterLocalProperties(criteria);
            }

            this.cache.searchResults[cacheKey] = properties;

            return properties;
        } catch (error) {
            console.error('Error searching properties:', error);

            // Fallback to filtering local data if API fails
            return this._filterLocalProperties(criteria);
        }
    }

    /**
     * Filter local properties based on search criteria
     * @param {Object} criteria Search criteria
     * @returns {Promise<Array>} Filtered properties
     */
    async _filterLocalProperties(criteria = {}) {
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

            // Filter by location
            if (criteria.location && criteria.location !== 'all') {
                if (property.address.city.toLowerCase() !== criteria.location.toLowerCase() &&
                    property.address.neighborhood.toLowerCase() !== criteria.location.toLowerCase()) {
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
            if (criteria.minBeds && criteria.minBeds !== 'any') {
                if (property.details.bedrooms < parseInt(criteria.minBeds)) {
                    return false;
                }
            }

            // Filter by minimum bathrooms
            if (criteria.minBaths && criteria.minBaths !== 'any') {
                if (property.details.bathrooms < parseInt(criteria.minBaths)) {
                    return false;
                }
            }

            return true;
        });
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
        // Check if we have properties in the expected format
        if (!rawProperties || !Array.isArray(rawProperties)) {
            console.warn('Invalid property data format:', rawProperties);
            return [];
        }

        // Handle different API response formats
        let propertiesToProcess = rawProperties;

        // If the API returns data in a nested format
        if (rawProperties.properties && Array.isArray(rawProperties.properties)) {
            propertiesToProcess = rawProperties.properties;
        } else if (rawProperties.data && Array.isArray(rawProperties.data)) {
            propertiesToProcess = rawProperties.data;
        } else if (rawProperties.results && Array.isArray(rawProperties.results)) {
            propertiesToProcess = rawProperties.results;
        } else if (rawProperties.home_search && rawProperties.home_search.results && Array.isArray(rawProperties.home_search.results)) {
            propertiesToProcess = rawProperties.home_search.results;
        }

        return propertiesToProcess.map((property, index) => {
            // Generate a unique ID if none exists
            const id = property.property_id || `prop-${index + 1}`;

            // Extract and format the price
            let price = property.price || property.list_price || 0;
            let priceDisplay = property.price_formatted || property.list_price_formatted || `$${price.toLocaleString()}`;

            // Determine status
            let status = 'For Sale';
            if (property.status) {
                if (typeof property.status === 'string') {
                    status = property.status.charAt(0).toUpperCase() + property.status.slice(1).replace('_', ' ');
                } else {
                    status = property.is_for_rent ? 'For Rent' : 'For Sale';
                }
            }

            // Extract address components
            const address = {
                streetAddress: property.address?.line || property.location?.address?.line || '',
                city: property.address?.city || property.location?.address?.city || 'Seattle',
                state: property.address?.state_code || property.location?.address?.state_code || 'WA',
                zipCode: property.address?.postal_code || property.location?.address?.postal_code || '',
                neighborhood: property.address?.neighborhood_name || property.location?.address?.neighborhood_name || ''
            };

            // Format location
            const location = {
                latitude: property.address?.lat || property.location?.address?.lat || 47.6062,
                longitude: property.address?.lon || property.location?.address?.lon || -122.3321
            };

            // Extract property details
            const details = {
                bedrooms: property.beds || property.bedrooms || 0,
                bathrooms: property.baths || property.bathrooms || 0,
                fullBathrooms: property.baths_full || 0,
                halfBathrooms: property.baths_half || 0,
                squareFeet: property.building_size?.size || property.sqft || 0,
                lotSize: property.lot_size?.size || property.lot_sqft || 0,
                yearBuilt: property.year_built || 0,
                propertyType: property.prop_type || property.property_type || 'Single Family',
                propertySubType: property.sub_type || ''
            };

            // Extract features
            let features = [];
            if (property.features && Array.isArray(property.features)) {
                features = property.features.map(f => typeof f === 'string' ? f : f.text || f.name || f);
            } else if (property.tags && Array.isArray(property.tags)) {
                features = property.tags;
            } else {
                features = ['Modern Design', 'Updated Kitchen', 'Hardwood Floors'];
            }

            // Extract description
            let description = '';
            if (property.description) {
                description = property.description;
            } else if (property.short_description) {
                description = property.short_description;
            } else if (property.text) {
                description = property.text;
            } else {
                description = `Beautiful ${details.bedrooms} bedroom, ${details.bathrooms} bathroom ${details.propertyType} located in ${address.city}, ${address.state}. Contact us for more details.`;
            }

            // Extract images
            let images = [];
            let primaryImage = '';

            // Handle different API response formats for images
            if (property.photos && Array.isArray(property.photos)) {
                // Handle photos array with href property (common format)
                if (property.photos[0] && property.photos[0].href) {
                    images = property.photos.map(photo => photo.href);
                    primaryImage = images[0];
                }
                // Handle photos array with url property
                else if (property.photos[0] && property.photos[0].url) {
                    images = property.photos.map(photo => photo.url);
                    primaryImage = images[0];
                }
                // Handle photos array of strings
                else if (typeof property.photos[0] === 'string') {
                    images = property.photos;
                    primaryImage = images[0];
                }
            }
            // Handle thumbnail property
            else if (property.thumbnail) {
                primaryImage = property.thumbnail;
                images = [primaryImage];
            }
            // Handle photo property
            else if (property.photo) {
                primaryImage = property.photo;
                images = [primaryImage];
            }
            // Handle primary_photo property
            else if (property.primary_photo && property.primary_photo.href) {
                primaryImage = property.primary_photo.href;
                images = [primaryImage];
            }
            // Handle photo_count and thumbnail properties
            else if (property.photo_count > 0 && property.thumbnail) {
                primaryImage = property.thumbnail;
                images = [primaryImage];

                // If we have multiple photos but only a thumbnail URL, try to generate additional photo URLs
                if (property.photo_count > 1 && property.property_id) {
                    // Some APIs use a pattern where thumbnail URLs can be modified to get additional photos
                    const baseUrl = primaryImage.split('?')[0];
                    const queryParams = primaryImage.split('?')[1] || '';

                    // Try to generate additional photo URLs based on common patterns
                    for (let i = 1; i < Math.min(property.photo_count, 5); i++) {
                        images.push(`${baseUrl.replace('_0.jpg', `_${i}.jpg`)}?${queryParams}`);
                    }
                }
            }
            // Handle Realty API format (photo object with href)
            else if (property.photo && typeof property.photo === 'object' && property.photo.href) {
                primaryImage = property.photo.href;
                images = [primaryImage];
            }
            // Handle Realty API format (thumbnail_url)
            else if (property.thumbnail_url) {
                primaryImage = property.thumbnail_url;
                images = [primaryImage];
            }
            // Handle Realty API format (photos array with href in different format)
            else if (property.photos && Array.isArray(property.photos) && property.photos.length > 0) {
                // Try different photo object formats
                const photoObjects = property.photos.filter(p => p && (p.href || p.url || (typeof p === 'object' && p.url)));

                if (photoObjects.length > 0) {
                    images = photoObjects.map(p => p.href || p.url || p.thumbnail || p);
                    primaryImage = images[0];
                }
            }
            // Handle Realty API format (multimedia array)
            else if (property.multimedia && Array.isArray(property.multimedia) && property.multimedia.length > 0) {
                const photoObjects = property.multimedia.filter(m => m && m.category === 'Image' && m.url);

                if (photoObjects.length > 0) {
                    images = photoObjects.map(p => p.url || p.href || p.thumbnail || p);
                    primaryImage = images[0];
                }
            }

            // If we still don't have any images, use our local images as fallback
            if (images.length === 0) {
                const propertyIndex = (index % 6) + 1;
                primaryImage = `images/property${propertyIndex}.jpg`;
                images = [
                    primaryImage,
                    `images/property${propertyIndex}-2.jpg`,
                    `images/property${propertyIndex}-3.jpg`
                ];
            }

            // Ensure all image URLs are valid and use HTTPS
            images = images.map(img => {
                if (!img) return 'images/property-placeholder.jpg';

                // If the URL is relative, make it absolute
                if (img.startsWith('/')) {
                    return `https://www.realtor.com${img}`;
                }
                // If the URL uses HTTP, convert to HTTPS
                if (img.startsWith('http:')) {
                    return img.replace('http:', 'https:');
                }
                return img;
            });

            // Remove any duplicate images
            images = [...new Set(images)];

            // Log the images we found for debugging
            console.log(`Property ${property.property_id || index}: Found ${images.length} images. Primary: ${primaryImage}`);

            // Extract agent information
            const listingAgent = {
                name: property.agents?.[0]?.name || property.agent_name || 'Tina Lee',
                company: property.office?.name || property.broker_name || 'WPI Real Estate Services',
                phone: property.office?.phones?.[0]?.number || property.agent_phone || '(206) 522-8172',
                email: property.agents?.[0]?.email || 'tina.lee@wpirealestate.com'
            };

            // Format dates
            const now = new Date();
            const datePosted = property.list_date || now.toISOString();
            const lastUpdated = property.last_update_date || now.toISOString();

            // Return the formatted property
            return {
                id,
                property_id: property.property_id || id,
                mlsId: property.mls?.id || property.listing_id || `NWM${Math.floor(1000000 + Math.random() * 9000000)}`,
                status,
                price,
                priceDisplay,
                address,
                location,
                details,
                features,
                description,
                virtualTourUrl: property.virtual_tour?.href || property.virtual_tour_url || '',
                listingAgent,
                images,
                primaryImage,
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
            'house': 'Houses',
            'condo': 'Condos',
            'townhouse': 'Townhomes',
            'multiplex': 'Multi-Family',
            'apartment': 'Apartments',
            'land': 'Land'
        };

        return typeMap[uiType] || 'Houses';
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
