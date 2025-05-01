/**
 * Tina Lee Real Estate - Properties JavaScript
 * Handles property data and display functionality
 */

// Property data will be loaded from the API
let properties = [];

// Import the API service
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load properties from the API
        properties = await propertyAPI.getAllProperties();

        // Initialize the property display
        initializeProperties();
    } catch (error) {
        console.error('Error initializing properties:', error);
    }
});

// Legacy code below is kept for compatibility
// In a real implementation, we would remove this
    {
        id: 1,
        title: "Waterfront Estate on Lake Washington",
        price: 12850000,
        priceDisplay: "$12,850,000",
        status: "For Sale",
        location: "1625 Lakeside Ave S, Medina, WA",
        area: "beachfront",
        type: "house",
        beds: 6,
        baths: 8,
        size: 8500,
        description: "Extraordinary waterfront estate on Lake Washington with 100 feet of private shoreline and breathtaking views of the Seattle skyline and Mt. Rainier. This architectural masterpiece features soaring ceilings, walls of glass, and impeccable craftsmanship throughout. The main level offers seamless indoor/outdoor living with a gourmet chef's kitchen, formal dining room, and great room opening to a covered terrace. The primary suite includes a spa-like bathroom, private balcony, and stunning water views. Additional amenities include a home theater, wine cellar, gym, elevator, private dock, and a 4-car garage with EV charging.",
        features: [
            "Lake Washington Waterfront",
            "Private Dock",
            "Seattle Skyline Views",
            "Chef's Kitchen",
            "Home Theater",
            "Wine Cellar",
            "Smart Home Technology",
            "4-Car Garage with EV Charging"
        ],
        image: "images/property1.jpg",
        images: [
            "images/property1.jpg",
            "images/property1-2.jpg",
            "images/property1-3.jpg",
            "images/property1-4.jpg"
        ]
    },
    {
        id: 2,
        title: "Luxury Downtown Seattle Penthouse",
        price: 5950000,
        priceDisplay: "$5,950,000",
        status: "For Sale",
        location: "1521 2nd Ave #3801, Seattle, WA",
        area: "downtown",
        type: "condo",
        beds: 3,
        baths: 4,
        size: 4200,
        description: "Spectacular full-floor penthouse in downtown Seattle with unobstructed 360-degree views of Elliott Bay, the Olympic Mountains, and the city skyline. This sophisticated residence features floor-to-ceiling windows, custom finishes, and an open concept living space perfect for entertaining. The gourmet kitchen includes top-of-the-line Wolf and Sub-Zero appliances, custom cabinetry, and a large island. The primary suite offers a spa-inspired bathroom with heated floors, a freestanding soaking tub, and a private terrace. Building amenities include 24-hour concierge, fitness center, owners' lounge, and secured parking with EV charging stations.",
        features: [
            "360-Degree Panoramic Views",
            "Full-Floor Penthouse",
            "Wolf & Sub-Zero Appliances",
            "Private Terraces",
            "Spa-Inspired Bathrooms",
            "24-Hour Concierge",
            "Fitness Center",
            "EV Charging Stations"
        ],
        image: "images/property2.jpg",
        images: [
            "images/property2.jpg",
            "images/property2-2.jpg",
            "images/property2-3.jpg",
            "images/property2-4.jpg"
        ]
    },
    {
        id: 3,
        title: "Modern Clyde Hill Estate",
        price: 8750000,
        priceDisplay: "$8,750,000",
        status: "For Sale",
        location: "9450 NE 25th St, Clyde Hill, WA",
        area: "suburbs",
        type: "house",
        beds: 5,
        baths: 6,
        size: 6800,
        description: "Stunning modern estate in prestigious Clyde Hill with sweeping views of Lake Washington, the Seattle skyline, and the Olympic Mountains. This architectural masterpiece features an open floor plan with walls of glass that flood the home with natural light and frame the spectacular views. The main level includes a chef's kitchen with premium Miele and Gaggenau appliances, formal dining room, great room with fireplace, and a covered outdoor living area with heaters and a built-in BBQ. The luxurious primary suite offers a spa-like bathroom, walk-in closet, and private deck. Additional features include a media room, wine cellar, gym, heated floors, smart home technology, and a 3-car garage with EV charging stations.",
        features: [
            "Lake & City Views",
            "Outdoor Living Space",
            "Media Room",
            "Wine Cellar",
            "Heated Floors",
            "Smart Home Technology",
            "Miele & Gaggenau Appliances",
            "3-Car Garage with EV Charging"
        ],
        image: "images/property3.jpg",
        images: [
            "images/property3.jpg",
            "images/property3-2.jpg",
            "images/property3-3.jpg",
            "images/property3-4.jpg"
        ]
    },
    {
        id: 4,
        title: "Mercer Island Waterfront Estate",
        price: 9850000,
        priceDisplay: "$9,850,000",
        status: "For Sale",
        location: "4450 East Mercer Way, Mercer Island, WA",
        area: "beachfront",
        type: "house",
        beds: 5,
        baths: 7,
        size: 7200,
        description: "Exquisite waterfront estate on Mercer Island with 75 feet of private shoreline and a deep-water dock. This timeless residence offers a perfect blend of luxury and comfort with expansive living spaces and spectacular views of Lake Washington. The main level features a grand entry, formal living and dining rooms, a gourmet kitchen with premium appliances, and a family room that opens to a covered terrace. The luxurious primary suite includes a sitting area, private balcony, and a spa-inspired bathroom. Lower level includes a wine cellar, home theater, and game room. The meticulously landscaped grounds feature a heated pool, outdoor kitchen, and private beach access.",
        features: [
            "Waterfront with Private Dock",
            "Heated Pool",
            "Outdoor Kitchen",
            "Home Theater",
            "Wine Cellar",
            "Game Room",
            "Private Beach Access",
            "3-Car Garage"
        ],
        image: "images/property4.jpg",
        images: [
            "images/property4.jpg",
            "images/property4-2.jpg",
            "images/property4-3.jpg",
            "images/property4-4.jpg"
        ]
    },
    {
        id: 5,
        title: "Luxury Bellevue Penthouse",
        price: 7500,
        priceDisplay: "$7,500/month",
        status: "For Rent",
        location: "10700 NE 4th St, Bellevue, WA",
        area: "downtown",
        type: "apartment",
        beds: 3,
        baths: 3,
        size: 2800,
        description: "Spectacular luxury penthouse in the heart of downtown Bellevue with stunning views of Lake Washington, Mt. Rainier, and the Cascade Mountains. This sophisticated residence features floor-to-ceiling windows, 10-foot ceilings, and designer finishes throughout. The gourmet kitchen includes premium appliances, custom cabinetry, and a large island perfect for entertaining. The primary suite offers a spa-inspired bathroom with heated floors and a walk-in closet. Building amenities include a rooftop terrace with outdoor kitchen, resort-style pool and spa, state-of-the-art fitness center, resident lounge, and 24-hour concierge services.",
        features: [
            "Lake & Mountain Views",
            "Floor-to-Ceiling Windows",
            "10-Foot Ceilings",
            "Designer Finishes",
            "Resort-Style Pool & Spa",
            "Rooftop Terrace",
            "24-Hour Concierge",
            "Secure Parking with EV Charging"
        ],
        image: "images/property5.jpg",
        images: [
            "images/property5.jpg",
            "images/property5-2.jpg",
            "images/property5-3.jpg",
            "images/property5-4.jpg"
        ]
    },
    {
        id: 6,
        title: "Sammamish Luxury Estate",
        price: 6250000,
        priceDisplay: "$6,250,000",
        status: "For Sale",
        location: "3245 E Lake Sammamish Pkwy NE, Sammamish, WA",
        area: "countryside",
        type: "house",
        beds: 6,
        baths: 7,
        size: 7500,
        description: "Magnificent estate nestled on 2.5 acres in prestigious Sammamish with breathtaking views of Lake Sammamish and the Cascade Mountains. This custom-built residence offers the perfect blend of luxury and comfort with exceptional craftsmanship and designer finishes throughout. The main level features a grand entry, formal living and dining rooms, a chef's kitchen with premium appliances, and a great room with floor-to-ceiling windows that frame the spectacular views. The resort-style backyard includes a heated pool and spa, outdoor kitchen, fire pit, and meticulously landscaped gardens. Additional amenities include a home theater, wine cellar, gym, game room, and a 4-car garage.",
        features: [
            "Lake & Mountain Views",
            "2.5 Acres of Land",
            "Heated Pool & Spa",
            "Outdoor Kitchen",
            "Home Theater",
            "Wine Cellar",
            "Game Room",
            "4-Car Garage"
        ],
        image: "images/property6.jpg",
        images: [
            "images/property6.jpg",
            "images/property6-2.jpg",
            "images/property6-3.jpg",
            "images/property6-4.jpg"
        ]
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the properties page
    const propertiesGrid = document.getElementById('properties-grid');

    if (propertiesGrid) {
        // Get URL parameters for filtering
        const urlParams = new URLSearchParams(window.location.search);
        const typeParam = urlParams.get('type');
        const locationParam = urlParams.get('location');
        const priceParam = urlParams.get('price');

        // Apply filters if they exist
        let filteredProperties = properties;

        if (typeParam && typeParam !== 'all') {
            filteredProperties = filteredProperties.filter(property => property.type === typeParam);
        }

        if (locationParam && locationParam !== 'all') {
            filteredProperties = filteredProperties.filter(property => property.area === locationParam);
        }

        if (priceParam && priceParam !== 'all') {
            if (priceParam === '1000000+') {
                filteredProperties = filteredProperties.filter(property => property.price >= 1000000);
            } else {
                const [min, max] = priceParam.split('-').map(Number);
                filteredProperties = filteredProperties.filter(property => property.price >= min && property.price <= max);
            }
        }

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
        propertiesGrid.innerHTML = '';

        // Display filtered properties
        if (filteredProperties.length > 0) {
            filteredProperties.forEach(property => {
                propertiesGrid.innerHTML += `
                    <div class="property-card">
                        <div class="property-image">
                            <span class="property-status">${property.status}</span>
                            <img src="${property.image}" alt="${property.title}" loading="lazy">
                        </div>
                        <div class="property-details">
                            <h3>${property.title}</h3>
                            <p class="property-price">${property.priceDisplay}</p>
                            <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                            <div class="property-features">
                                <span><i class="fas fa-bed"></i> ${property.beds} Beds</span>
                                <span><i class="fas fa-bath"></i> ${property.baths} Baths</span>
                                <span><i class="fas fa-ruler-combined"></i> ${property.size} sqft</span>
                            </div>
                            <a href="property-details.html?id=${property.id}" class="view-details-btn">View Details</a>
                        </div>
                    </div>
                `;
            });
        } else {
            propertiesGrid.innerHTML = `
                <div class="no-properties">
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
    }

    // Check if we're on the property details page
    const propertyDetailsContainer = document.getElementById('property-details-container');

    if (propertyDetailsContainer) {
        // Get property ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = parseInt(urlParams.get('id'));

        // Find the property
        const property = properties.find(p => p.id === propertyId);

        if (property) {
            // Update page title
            document.title = `${property.title} | Tina Lee Real Estate`;

            // Display property details
            propertyDetailsContainer.innerHTML = `
                <div class="property-gallery">
                    <div class="main-image">
                        <img src="${property.images[0]}" alt="${property.title}" id="main-property-image" loading="lazy">
                    </div>
                    <div class="thumbnail-gallery">
                        ${property.images.map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${img}">
                                <img src="${img}" alt="${property.title} - Image ${index + 1}" loading="lazy">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="property-info">
                    <div class="property-header">
                        <h1>${property.title}</h1>
                        <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                        <p class="property-price">${property.priceDisplay}</p>
                    </div>
                    <div class="property-specs">
                        <div class="spec">
                            <i class="fas fa-bed"></i>
                            <span>${property.beds}</span>
                            <p>Bedrooms</p>
                        </div>
                        <div class="spec">
                            <i class="fas fa-bath"></i>
                            <span>${property.baths}</span>
                            <p>Bathrooms</p>
                        </div>
                        <div class="spec">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${property.size}</span>
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
                    alert('Thank you for your interest! Please contact Tina Lee at (555) 123-4567 to schedule a viewing.');
                });
            }
        } else {
            propertyDetailsContainer.innerHTML = `
                <div class="property-not-found">
                    <h2>Property Not Found</h2>
                    <p>The property you are looking for does not exist or has been removed.</p>
                    <a href="properties.html" class="back-btn">Back to Properties</a>
                </div>
            `;
        }
    }

    // Check if we're on the homepage
    const featuredPropertiesGrid = document.getElementById('featured-properties-grid');

    if (featuredPropertiesGrid && window.location.pathname.includes('index.html')) {
        // Display featured properties (first 3)
        featuredPropertiesGrid.innerHTML = '';

        properties.slice(0, 3).forEach(property => {
            featuredPropertiesGrid.innerHTML += `
                <div class="property-card">
                    <div class="property-image">
                        <span class="property-status">${property.status}</span>
                        <img src="${property.image}" alt="${property.title}" loading="lazy">
                    </div>
                    <div class="property-details">
                        <h3>${property.title}</h3>
                        <p class="property-price">${property.priceDisplay}</p>
                        <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                        <div class="property-features">
                            <span><i class="fas fa-bed"></i> ${property.beds} Beds</span>
                            <span><i class="fas fa-bath"></i> ${property.baths} Baths</span>
                            <span><i class="fas fa-ruler-combined"></i> ${property.size} sqft</span>
                        </div>
                        <a href="property-details.html?id=${property.id}" class="view-details-btn">View Details</a>
                    </div>
                </div>
            `;
        });
    }
});
