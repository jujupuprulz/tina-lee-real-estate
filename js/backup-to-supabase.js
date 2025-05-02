/**
 * Backup Real Estate Data to Supabase
 * This script exports property data from the local JavaScript files to Supabase
 */

// Supabase configuration
const SUPABASE_URL = 'https://guqubcdsalglyqoqutee.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cXViY2RzYWxnbHlxb3F1dGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzE0ODMsImV4cCI6MjA2MDQ0NzQ4M30.D5_5keV7Kxjfj-zDpyLG-ff_D6qxonR4DQxtT0nR5-Q';

// Initialize Supabase client
async function initSupabase() {
    try {
        // Check if the Supabase library is loaded
        if (typeof supabaseClient !== 'undefined') {
            return supabaseClient;
        } else if (typeof supabase !== 'undefined') {
            return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else if (typeof window.supabase !== 'undefined') {
            return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            // Create a new client if the global one isn't available
            console.log('Creating new Supabase client...');
            // Check if the createClient function is available
            if (typeof createClient === 'function') {
                return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            } else {
                throw new Error('Supabase client library not found. Please include the Supabase JavaScript library.');
            }
        }
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return null;
    }
}

/**
 * Backup properties to Supabase
 * @param {Array} properties Array of property objects
 * @returns {Promise<Object>} Result of the backup operation
 */
async function backupPropertiesToSupabase(properties) {
    try {
        const supabaseClient = await initSupabase();
        if (!supabaseClient) return { success: false, message: 'Failed to initialize Supabase client' };

        console.log(`Starting backup of ${properties.length} properties to Supabase...`);

        // Track results
        const results = {
            success: true,
            propertiesAdded: 0,
            propertiesFailed: 0,
            imagesAdded: 0,
            featuresAdded: 0,
            errors: []
        };

        // Process each property
        for (const property of properties) {
            try {
                // Format property data for Supabase
                const propertyData = {
                    property_id: property.property_id,
                    mls_id: property.mlsId,
                    status: property.status,
                    price: property.price,
                    price_display: property.priceDisplay,
                    street_address: property.address.streetAddress,
                    city: property.address.city,
                    state: property.address.state,
                    zip_code: property.address.zipCode,
                    neighborhood: property.address.neighborhood,
                    latitude: property.location.latitude,
                    longitude: property.location.longitude,
                    bedrooms: property.details.bedrooms,
                    bathrooms: property.details.bathrooms,
                    square_feet: property.details.squareFeet,
                    lot_size: property.details.lotSize,
                    year_built: property.details.yearBuilt,
                    property_type: property.details.propertyType,
                    property_sub_type: property.details.propertySubType,
                    description: property.description,
                    primary_image: property.images[0],
                    listing_agent_name: property.listingAgent.name,
                    listing_agent_company: property.listingAgent.company,
                    listing_agent_phone: property.listingAgent.phone,
                    listing_agent_email: property.listingAgent.email,
                    date_posted: property.datePosted,
                    last_updated: property.lastUpdated
                };

                // Insert property into Supabase
                const { data: insertedProperty, error: propertyError } = await supabaseClient
                    .from('properties')
                    .upsert(propertyData, { onConflict: 'property_id' })
                    .select();

                if (propertyError) {
                    console.error(`Error adding property ${property.id}:`, propertyError);
                    results.propertiesFailed++;
                    results.errors.push({
                        property_id: property.property_id,
                        error: propertyError.message
                    });
                    continue;
                }

                results.propertiesAdded++;
                console.log(`Added property: ${property.address.streetAddress}, ${property.address.city}`);

                // Add property images
                if (property.images && property.images.length > 0) {
                    const imagePromises = property.images.map(async (imageUrl, index) => {
                        const imageData = {
                            property_id: property.property_id,
                            image_url: imageUrl,
                            image_order: index
                        };

                        const { error: imageError } = await supabaseClient
                            .from('property_images')
                            .upsert(imageData, { onConflict: ['property_id', 'image_order'] });

                        if (imageError) {
                            console.error(`Error adding image for property ${property.id}:`, imageError);
                            results.errors.push({
                                property_id: property.property_id,
                                error: `Image error: ${imageError.message}`
                            });
                            return false;
                        }
                        return true;
                    });

                    const imageResults = await Promise.all(imagePromises);
                    results.imagesAdded += imageResults.filter(result => result).length;
                }

                // Add property features
                if (property.features && property.features.length > 0) {
                    const featurePromises = property.features.map(async (feature) => {
                        const featureData = {
                            property_id: property.property_id,
                            feature_name: feature
                        };

                        const { error: featureError } = await supabaseClient
                            .from('property_features')
                            .upsert(featureData, { onConflict: ['property_id', 'feature_name'] });

                        if (featureError) {
                            console.error(`Error adding feature for property ${property.id}:`, featureError);
                            results.errors.push({
                                property_id: property.property_id,
                                error: `Feature error: ${featureError.message}`
                            });
                            return false;
                        }
                        return true;
                    });

                    const featureResults = await Promise.all(featurePromises);
                    results.featuresAdded += featureResults.filter(result => result).length;
                }

            } catch (error) {
                console.error(`Error processing property ${property.id}:`, error);
                results.propertiesFailed++;
                results.errors.push({
                    property_id: property.property_id || property.id,
                    error: error.message
                });
            }
        }

        console.log('Backup to Supabase completed!');
        console.log(`Properties added: ${results.propertiesAdded}`);
        console.log(`Properties failed: ${results.propertiesFailed}`);
        console.log(`Images added: ${results.imagesAdded}`);
        console.log(`Features added: ${results.featuresAdded}`);

        if (results.errors.length > 0) {
            console.log('Errors encountered:');
            console.log(results.errors);
        }

        return results;

    } catch (error) {
        console.error('Error backing up to Supabase:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Start the backup process
 */
async function startBackup() {
    try {
        console.log('Starting Supabase backup process...');

        // Get properties from the API
        console.log('Fetching properties from API...');
        const properties = await realEstateAPI.getAllProperties();

        if (!properties || properties.length === 0) {
            const errorMsg = 'No properties found to backup';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        console.log(`Found ${properties.length} properties to backup`);

        // Backup to Supabase
        console.log('Starting backup to Supabase...');
        const results = await backupPropertiesToSupabase(properties);

        // Display results
        const resultElement = document.getElementById('supabase-backup-results');
        if (resultElement) {
            if (results.success) {
                resultElement.innerHTML = `
                    <div class="backup-success">
                        <h3>Backup Successful!</h3>
                        <p>Properties added: ${results.propertiesAdded}</p>
                        <p>Images added: ${results.imagesAdded}</p>
                        <p>Features added: ${results.featuresAdded}</p>
                        ${results.propertiesFailed > 0 ? `<p>Properties failed: ${results.propertiesFailed}</p>` : ''}
                    </div>
                `;
            } else {
                resultElement.innerHTML = `
                    <div class="backup-error">
                        <h3>Backup Failed</h3>
                        <p>${results.message}</p>
                    </div>
                `;
                throw new Error(results.message);
            }
        }

        return results;
    } catch (error) {
        console.error('Error starting backup:', error);
        const resultElement = document.getElementById('supabase-backup-results');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="backup-error">
                    <h3>Backup Failed</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
        throw error; // Re-throw the error so it can be caught by the caller
    }
}

// Export functions
window.backupToSupabase = {
    startBackup
};
