/**
 * Backup Website Content to Supabase
 * This script exports website content and insights data to Supabase
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
 * Backup website content to Supabase
 * @returns {Promise<Object>} Result of the backup operation
 */
async function backupWebsiteContentToSupabase() {
    try {
        const supabaseClient = await initSupabase();
        if (!supabaseClient) return { success: false, message: 'Failed to initialize Supabase client' };

        console.log('Starting backup of website content to Supabase...');

        // Track results
        const results = {
            success: true,
            pagesAdded: 0,
            insightsAdded: 0,
            marketTrendsAdded: 0,
            errors: []
        };

        // Backup website pages
        const websitePages = [
            { id: 'home', title: 'Home Page', url: 'index.html', last_updated: new Date().toISOString() },
            { id: 'insights', title: 'Real Estate Insights', url: 'insights.html', last_updated: new Date().toISOString() },
            { id: 'about', title: 'About Tina Lee', url: 'about.html', last_updated: new Date().toISOString() },
            { id: 'contact', title: 'Contact Page', url: 'contact.html', last_updated: new Date().toISOString() }
        ];

        // Insert website pages into Supabase
        const { error: pagesError } = await supabaseClient
            .from('website_pages')
            .upsert(websitePages, { onConflict: 'id' });

        if (pagesError) {
            console.error('Error adding website pages:', pagesError);
            results.errors.push({
                type: 'website_pages',
                error: pagesError.message
            });
        } else {
            results.pagesAdded = websitePages.length;
            console.log(`Added ${websitePages.length} website pages`);
        }

        // Backup market insights
        const marketInsights = [
            {
                id: 'market-trends-2025',
                title: 'Seattle Housing Market Trends for 2025',
                category: 'Market Analysis',
                excerpt: 'The Seattle housing market continues to evolve with new trends emerging in 2025. From shifting neighborhood hotspots to changing buyer preferences, understanding these trends is crucial for both buyers and investors.',
                content: 'The Seattle housing market continues to show strong appreciation with median home prices up 4.8% year-over-year. Inventory remains tight in premium neighborhoods, creating competitive conditions for buyers. Emerging neighborhoods like South Lake Union and Beacon Hill are showing strong growth potential with new development and infrastructure improvements.',
                image_url: 'images/seattle-skyline.jpg',
                published_date: '2025-05-01',
                last_updated: new Date().toISOString()
            },
            {
                id: 'neighborhood-guide-2025',
                title: 'Top 5 Seattle Neighborhoods for Families in 2025',
                category: 'Neighborhood Guide',
                excerpt: 'Discover the best family-friendly neighborhoods in Seattle with top schools, parks, and community amenities.',
                content: 'Seattle offers numerous family-friendly neighborhoods with excellent schools, parks, and community amenities. Our top picks for 2025 include Ballard, Green Lake, Maple Leaf, West Seattle, and Ravenna. Each neighborhood offers unique advantages for families looking to settle in the Seattle area.',
                image_url: 'images/neighborhood-guide.jpg',
                published_date: '2025-04-15',
                last_updated: new Date().toISOString()
            },
            {
                id: 'investment-portfolio',
                title: 'Building a Diversified Real Estate Portfolio',
                category: 'Investment',
                excerpt: 'Learn how to create a balanced real estate investment portfolio that minimizes risk while maximizing returns.',
                content: 'A diversified real estate portfolio should include a mix of property types, locations, and investment strategies. Consider including single-family homes, multi-family properties, and commercial real estate to spread risk and capture different market opportunities. Focus on both cash flow and appreciation potential to create a balanced portfolio.',
                image_url: 'images/investment-strategy.jpg',
                published_date: '2025-03-28',
                last_updated: new Date().toISOString()
            }
        ];

        // Insert market insights into Supabase
        const { error: insightsError } = await supabaseClient
            .from('market_insights')
            .upsert(marketInsights, { onConflict: 'id' });

        if (insightsError) {
            console.error('Error adding market insights:', insightsError);
            results.errors.push({
                type: 'market_insights',
                error: insightsError.message
            });
        } else {
            results.insightsAdded = marketInsights.length;
            console.log(`Added ${marketInsights.length} market insights`);
        }

        // Backup market trends data
        const marketTrends = [
            {
                id: 'median-home-price',
                title: 'Median Home Price',
                value: '$985,000',
                change_percent: 4.8,
                description: 'Up 4.8% year-over-year, showing steady appreciation in the Seattle market.',
                icon: 'fa-home',
                last_updated: new Date().toISOString()
            },
            {
                id: 'price-per-sqft',
                title: 'Price Per Sq Ft',
                value: '$525',
                change_percent: 3.2,
                description: 'Increased by 3.2% from last year, with premium locations commanding higher rates.',
                icon: 'fa-chart-line',
                last_updated: new Date().toISOString()
            },
            {
                id: 'days-on-market',
                title: 'Days on Market',
                value: '18',
                change_percent: -25,
                description: 'Down from 24 days last year, indicating a competitive seller\'s market.',
                icon: 'fa-calendar-day',
                last_updated: new Date().toISOString()
            },
            {
                id: 'mortgage-rates',
                title: 'Mortgage Rates',
                value: '5.2%',
                change_percent: 0.3,
                description: 'Current 30-year fixed rate, affecting affordability and buying power.',
                icon: 'fa-percentage',
                last_updated: new Date().toISOString()
            }
        ];

        // Insert market trends into Supabase
        const { error: trendsError } = await supabaseClient
            .from('market_trends')
            .upsert(marketTrends, { onConflict: 'id' });

        if (trendsError) {
            console.error('Error adding market trends:', trendsError);
            results.errors.push({
                type: 'market_trends',
                error: trendsError.message
            });
        } else {
            results.marketTrendsAdded = marketTrends.length;
            console.log(`Added ${marketTrends.length} market trends`);
        }

        console.log('Backup to Supabase completed!');
        console.log(`Pages added: ${results.pagesAdded}`);
        console.log(`Insights added: ${results.insightsAdded}`);
        console.log(`Market trends added: ${results.marketTrendsAdded}`);

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

        // Backup website content to Supabase
        console.log('Starting backup of website content...');
        const results = await backupWebsiteContentToSupabase();

        // Display results
        const resultElement = document.getElementById('supabase-backup-results');
        if (resultElement) {
            if (results.success) {
                resultElement.innerHTML = `
                    <div class="backup-success">
                        <h3>Backup Successful!</h3>
                        <p>Website pages backed up: ${results.pagesAdded}</p>
                        <p>Market insights backed up: ${results.insightsAdded}</p>
                        <p>Market trends backed up: ${results.marketTrendsAdded}</p>
                        ${results.errors.length > 0 ? `<p>Errors encountered: ${results.errors.length}</p>` : ''}
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
