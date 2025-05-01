# Tina Lee Real Estate Website

A professional and modern real estate website for Tina Lee.

## Overview

This website is designed to showcase Tina Lee's real estate services and property listings. It features a clean, modern design with responsive layouts that work well on all devices.

## Features

- **Homepage**: Featuring a hero section with property search, featured listings, services, testimonials, and a call-to-action.
- **Properties Page**: Browse all property listings with filtering options.
- **Property Details Page**: View detailed information about individual properties.
- **About Page**: Learn about Tina Lee's background, credentials, and values.
- **Contact Page**: Get in touch with Tina Lee through a contact form or find contact information.

## Files and Structure

- **HTML Files**:
  - `index.html` - Homepage
  - `properties.html` - Property listings page
  - `property-details.html` - Individual property details page
  - `about.html` - About Tina Lee page
  - `contact.html` - Contact information and form

- **CSS Files**:
  - `css/styles.css` - Main stylesheet for the entire website

- **JavaScript Files**:
  - `js/main.js` - Common functionality across the website
  - `js/properties.js` - Property data and display functionality

- **Images**:
  - `images/` - Directory containing all website images

## Setup Instructions

1. Copy all files to your web server or hosting provider.
2. Replace the placeholder images in the `images/` directory with actual property and profile images.
3. Update the property data in `js/properties.js` with your actual property listings.
4. Customize contact information, about details, and other content to match Tina Lee's information.

## Customization

### Changing Colors

The website uses a color scheme defined in CSS variables. To change the colors, edit the following variables in `css/styles.css`:

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #e74c3c;
    --accent-color: #3498db;
    /* other color variables */
}
```

### Adding Properties

To add new properties, edit the `properties` array in `js/properties.js`. Each property should follow this structure:

```javascript
{
    id: 7, // Unique ID
    title: "Property Title",
    price: 500000, // Price as a number
    priceDisplay: "$500,000", // Formatted price string
    status: "For Sale", // "For Sale" or "For Rent"
    location: "Property Address",
    area: "downtown", // Area category
    type: "house", // Property type
    beds: 3, // Number of bedrooms
    baths: 2, // Number of bathrooms
    size: 1800, // Square footage
    description: "Detailed property description...",
    features: [
        "Feature 1",
        "Feature 2",
        // etc.
    ],
    image: "images/property7.jpg", // Main image
    images: [
        "images/property7.jpg",
        "images/property7-2.jpg",
        // etc.
    ]
}
```

## Browser Compatibility

This website is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Credits

- Fonts: Google Fonts (Poppins, Playfair Display)
- Icons: Font Awesome
- Map: Google Maps Embed API

## License

This website template is created for Tina Lee's personal use.

---

For questions or support, please contact the developer.
