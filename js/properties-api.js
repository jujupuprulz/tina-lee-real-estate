/**
 * Tina Lee Real Estate - Properties JavaScript
 * Handles property data and display functionality using the API
 */

// Initialize properties array
let properties = [];

// Function to initialize the properties
async function initializeProperties() {
    try {
        // Display featured properties on homepage
        const featuredPropertiesGrid = document.getElementById('featured-properties-grid');
        if (featuredPropertiesGrid && (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/'))) {
            await displayFeaturedProperties(featuredPropertiesGrid);
        }

        // Handle properties listing page
        const propertiesGrid = document.getElementById('properties-grid');
        if (propertiesGrid) {
            await handlePropertiesPage(propertiesGrid);
        }

        // Handle property details page
        const propertyDetailsContainer = document.getElementById('property-details-container');
        if (propertyDetailsContainer) {
            await handlePropertyDetailsPage(propertyDetailsContainer);
        }
    } catch (error) {
        console.error('Error initializing properties:', error);
    }
}

// Function to display featured properties on the homepage
async function displayFeaturedProperties(container) {
    try {
        // Clear the container
        container.innerHTML = '';

        // Get featured properties from the API
        const featuredProperties = await realEstateAPI.getFeaturedProperties();

        featuredProperties.forEach(property => {
            const propertyCard = document.createElement('div');
            propertyCard.className = 'property-card';

            // Format the property data for display
            const formattedProperty = formatPropertyForDisplay(property);

            propertyCard.innerHTML = `
                <div class="property-image">
                    <span class="property-status">${property.status}</span>
                    <img src="${property.primaryImage || property.images[0]}" alt="${formattedProperty.title}" loading="lazy" onerror="this.onerror=null; this.src='images/property-placeholder.jpg';">
                </div>
                <div class="property-details">
                    <h3>${formattedProperty.title}</h3>
                    <p class="property-price">${property.priceDisplay}</p>
                    <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${formattedProperty.location}</p>
                    <div class="property-features">
                        <span><i class="fas fa-bed"></i> ${property.details.bedrooms} Beds</span>
                        <span><i class="fas fa-bath"></i> ${property.details.bathrooms} Baths</span>
                        <span><i class="fas fa-ruler-combined"></i> ${property.details.squareFeet.toLocaleString()} sqft</span>
                    </div>
                    <a href="property-details.html?id=${property.id}" class="view-details-btn">View Details</a>
                </div>
            `;
            container.appendChild(propertyCard);
        });
    } catch (error) {
        console.error('Error displaying featured properties:', error);
        container.innerHTML = '<p>Unable to load featured properties. Please try again later.</p>';
    }
}

// Function to handle the properties listing page
async function handlePropertiesPage(container) {
    try {
        // Get URL parameters for filtering
        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get('type');
        const locationParam = urlParams.get('location');
        const priceParam = urlParams.get('price');

        // Create search criteria object
        const searchCriteria = {
            propertyType: typeParam || 'all',
            location: locationParam || 'all',
            priceRange: priceParam || 'all'
        };

        // Search properties with criteria
        const filteredProperties = await realEstateAPI.searchProperties(searchCriteria);

        // Set filter form values based on URL parameters
        if (typeParam) {
            document.getElementById('filter-type').value = typeParam;
        }

        if (locationParam) {
            document.getElementById('filter-location').value = locationParam;
        }

        if (priceParam) {
            document.getElementById('filter-price').value = priceParam;
        }

        // Clear existing properties
        container.innerHTML = '';

        // Display filtered properties
        if (filteredProperties.length > 0) {
            filteredProperties.forEach(property => {
                const formattedProperty = formatPropertyForDisplay(property);

                container.innerHTML += `
                    <div class="property-card">
                        <div class="property-image">
                            <span class="property-status">${property.status}</span>
                            <img src="${property.primaryImage || property.images[0]}" alt="${formattedProperty.title}" loading="lazy" onerror="this.onerror=null; this.src='images/property-placeholder.jpg';">
                        </div>
                        <div class="property-details">
                            <h3>${formattedProperty.title}</h3>
                            <p class="property-price">${property.priceDisplay}</p>
                            <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${formattedProperty.location}</p>
                            <div class="property-features">
                                <span><i class="fas fa-bed"></i> ${property.details.bedrooms} Beds</span>
                                <span><i class="fas fa-bath"></i> ${property.details.bathrooms} Baths</span>
                                <span><i class="fas fa-ruler-combined"></i> ${property.details.squareFeet.toLocaleString()} sqft</span>
                            </div>
                            <a href="property-details.html?id=${property.id}" class="view-details-btn">View Details</a>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `
                <div class="no-properties-message">
                    <h3>No properties found</h3>
                    <p>Please try different search criteria.</p>
                </div>
            `;
        }

        // Property filter form submission
        const propertyFilterForm = document.getElementById('property-filter-form');

        if (propertyFilterForm) {
            propertyFilterForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const type = document.getElementById('filter-type').value;
                const location = document.getElementById('filter-location').value;
                const price = document.getElementById('filter-price').value;

                // Redirect with new filter parameters
                window.location.href = `properties.html?type=${type}&location=${location}&price=${price}`;
            });
        }
    } catch (error) {
        console.error('Error handling properties page:', error);
        container.innerHTML = '<p>Unable to load properties. Please try again later.</p>';
    }
}

// Function to handle the property details page
async function handlePropertyDetailsPage(container) {
    try {
        // Get property ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = parseInt(urlParams.get('id'));

        // Get the property from the API
        const property = await realEstateAPI.getPropertyById(propertyId);

        if (property) {
            // Format the property data
            const formattedProperty = formatPropertyForDisplay(property);

            // Update page title
            document.title = `${formattedProperty.title} | Tina Lee Real Estate`;

            // Display property details
            container.innerHTML = `
                <div class="property-gallery">
                    <div class="main-image">
                        <img src="${property.primaryImage || property.images[0]}" alt="${formattedProperty.title}" id="main-property-image" loading="lazy" onerror="this.onerror=null; this.src='images/property-placeholder.jpg';">
                    </div>
                    <div class="thumbnail-gallery">
                        ${property.images.map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${img}">
                                <img src="${img}" alt="${formattedProperty.title} - Image ${index + 1}" loading="lazy" onerror="this.onerror=null; this.src='images/property-placeholder.jpg';">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="property-info">
                    <div class="property-header">
                        <h1>${formattedProperty.title}</h1>
                        <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${formattedProperty.location}</p>
                        <p class="property-price">${property.priceDisplay}</p>
                    </div>
                    <div class="property-specs">
                        <div class="spec">
                            <i class="fas fa-bed"></i>
                            <span>${property.details.bedrooms}</span>
                            <p>Bedrooms</p>
                        </div>
                        <div class="spec">
                            <i class="fas fa-bath"></i>
                            <span>${property.details.bathrooms}</span>
                            <p>Bathrooms</p>
                        </div>
                        <div class="spec">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${property.details.squareFeet.toLocaleString()}</span>
                            <p>Square Feet</p>
                        </div>
                        <div class="spec">
                            <i class="fas fa-tag"></i>
                            <span>${property.status}</span>
                            <p>Status</p>
                        </div>
                    </div>
                    <div class="property-description">
                        <h2>Description</h2>
                        <p>${property.description}</p>
                    </div>
                    <div class="property-features-list">
                        <h2>Features</h2>
                        <ul>
                            ${property.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="property-actions">
                        <a href="contact.html?property=${propertyId}" class="contact-btn">Contact Agent</a>
                        <button class="schedule-btn">Schedule Viewing</button>
                    </div>
                </div>
            `;

            // Thumbnail gallery functionality
            const thumbnails = document.querySelectorAll('.thumbnail');
            const mainImage = document.getElementById('main-property-image');

            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', function() {
                    // Update main image
                    mainImage.src = this.dataset.image;

                    // Update active thumbnail
                    thumbnails.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            // Schedule viewing button
            const scheduleBtn = document.querySelector('.schedule-btn');

            if (scheduleBtn) {
                scheduleBtn.addEventListener('click', function() {
                    alert(`Thank you for your interest in ${formattedProperty.title}! Please contact ${property.listingAgent.name} at ${property.listingAgent.phone} to schedule a viewing.`);
                });
            }

            // Load similar properties
            await displaySimilarProperties(property);

        } else {
            container.innerHTML = `
                <div class="property-not-found">
                    <h2>Property Not Found</h2>
                    <p>The property you are looking for does not exist or has been removed.</p>
                    <a href="properties.html" class="back-btn">Back to Properties</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error handling property details page:', error);
        container.innerHTML = '<p>Unable to load property details. Please try again later.</p>';
    }
}

// Function to display similar properties
async function displaySimilarProperties(currentProperty) {
    try {
        const similarPropertiesContainer = document.getElementById('similar-properties-grid');
        if (!similarPropertiesContainer) return;

        // Get all properties
        const allProperties = await realEstateAPI.getAllProperties();

        // Filter out the current property and get properties with similar characteristics
        const similarProperties = allProperties
            .filter(property => property.id !== currentProperty.id) // Exclude current property
            .filter(property => {
                // Match by property type or price range (within 30% of current property price)
                const sameType = property.details.propertyType === currentProperty.details.propertyType;
                const priceRatio = property.price / currentProperty.price;
                const similarPrice = priceRatio >= 0.7 && priceRatio <= 1.3;

                return sameType || similarPrice;
            })
            .slice(0, 3); // Get up to 3 similar properties

        // If we don't have enough similar properties, just get random ones
        if (similarProperties.length < 3) {
            const randomProperties = allProperties
                .filter(property => property.id !== currentProperty.id && !similarProperties.some(p => p.id === property.id))
                .sort(() => 0.5 - Math.random()) // Shuffle
                .slice(0, 3 - similarProperties.length);

            similarProperties.push(...randomProperties);
        }

        // Clear the container
        similarPropertiesContainer.innerHTML = '';

        // Display similar properties
        if (similarProperties.length > 0) {
            similarProperties.forEach(property => {
                const formattedProperty = formatPropertyForDisplay(property);

                similarPropertiesContainer.innerHTML += `
                    <div class="property-card">
                        <div class="property-image">
                            <span class="property-status">${property.status}</span>
                            <img src="${property.primaryImage || property.images[0]}" alt="${formattedProperty.title}" loading="lazy" onerror="this.onerror=null; this.src='images/property-placeholder.jpg';">
                        </div>
                        <div class="property-details">
                            <h3>${formattedProperty.title}</h3>
                            <p class="property-price">${property.priceDisplay}</p>
                            <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${formattedProperty.location}</p>
                            <div class="property-features">
                                <span><i class="fas fa-bed"></i> ${property.details.bedrooms} Beds</span>
                                <span><i class="fas fa-bath"></i> ${property.details.bathrooms} Baths</span>
                                <span><i class="fas fa-ruler-combined"></i> ${property.details.squareFeet.toLocaleString()} sqft</span>
                            </div>
                            <a href="property-details.html?id=${property.id}" class="view-details-btn">View Details</a>
                        </div>
                    </div>
                `;
            });
        } else {
            similarPropertiesContainer.innerHTML = '<p>No similar properties found.</p>';
        }
    } catch (error) {
        console.error('Error displaying similar properties:', error);
        const similarPropertiesContainer = document.getElementById('similar-properties-grid');
        if (similarPropertiesContainer) {
            similarPropertiesContainer.innerHTML = '<p>Unable to load similar properties.</p>';
        }
    }
}

// Helper function to format property data for display
function formatPropertyForDisplay(property) {
    // Create a formatted title if none exists
    const title = property.title ||
        `${property.details.bedrooms} Bed ${property.details.propertyType} in ${property.address.neighborhood}`;

    // Create a formatted location
    const location = property.address ?
        `${property.address.streetAddress}, ${property.address.city}, ${property.address.state} ${property.address.zipCode}` :
        property.location;

    return {
        title,
        location
    };
}

// Initialize properties when the DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load all properties from the API
        properties = await realEstateAPI.getAllProperties();

        // Initialize the property display
        await initializeProperties();
    } catch (error) {
        console.error('Error initializing properties:', error);
    }
});
