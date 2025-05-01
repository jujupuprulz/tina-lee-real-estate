# Tina Lee Real Estate Website

A professional and modern real estate website for Tina Lee, featuring real property data from a free real estate API.

## Overview

This website is designed to showcase Tina Lee's real estate services and property listings. It features a clean, modern design with responsive layouts that work well on all devices. The website connects to a real estate API to display actual property listings.

## Features

- **Homepage**: Featuring a hero section with property search, featured listings, services, testimonials, and a call-to-action.
- **Properties Page**: Browse all property listings with filtering options.
- **Property Details Page**: View detailed information about individual properties with similar property suggestions.
- **About Page**: Learn about Tina Lee's background, credentials, and values.
- **Contact Page**: Get in touch with Tina Lee through a contact form or find contact information with an interactive map.

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
  - `js/real-estate-api.js` - API connection to fetch real property data
  - `js/properties-api.js` - Property display and interaction functionality
  - `js/api.js` - Legacy API file (for backup)

- **Images**:
  - `images/` - Directory containing all website images

- **Data**:
  - `data/seattle-properties.json` - Fallback property data if API is unavailable

## Setup Instructions

1. Copy all files to your web server or hosting provider.
2. Replace the placeholder images in the `images/` directory with actual property and profile images.
3. The website automatically connects to a free real estate API to display properties. No additional setup is needed for property data.
4. Customize contact information, about details, and other content to match Tina Lee's information.
5. The website includes fallback data in case the API is unavailable.

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

### API Integration

The website uses the USA Real Estate API from RapidAPI to fetch real property data. The integration is handled in `js/real-estate-api.js`. The API provides:

- Property listings with detailed information
- Property search functionality
- Property details including features, descriptions, and images

If you need to modify the API integration:

```javascript
// RapidAPI configuration
this.baseUrl = 'https://us-real-estate.p.rapidapi.com';
this.headers = {
    'X-RapidAPI-Key': 'YOUR_API_KEY',
    'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
};

// Default location (can be changed)
this.defaultLocation = {
    city: 'Seattle',
    state_code: 'WA',
    limit: 10,
    offset: 0
};
```

### Fallback Data

If the API is unavailable, the website uses fallback data from `data/seattle-properties.json`. You can edit this file to update the fallback properties.

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
- Map: OpenStreetMap with Leaflet.js
- Property Data: USA Real Estate API (RapidAPI)

## License

This website template is created for Tina Lee's personal use.

---

For questions or support, please contact the developer.
