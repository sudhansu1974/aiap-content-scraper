import axios from 'axios';
import { isValidUrl } from '../utils';

// Firecrawl API configuration
const API_KEY = process.env.FIRECRAWL_API_KEY || '';
const API_URL = process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev';

// Flag to use mock data when API key is missing
const USE_MOCK_DATA = !API_KEY || process.env.NODE_ENV === 'development';

if (!API_KEY) {
    console.warn(
        'Missing Firecrawl API key. Using mock data instead. Please set FIRECRAWL_API_KEY environment variable.'
    );
}

// Types for Firecrawl API responses
export interface FirecrawlResponse {
    url: string;
    title: string | null;
    headings: {
        tag: string;
        text: string;
        level?: number;
    }[];
    links: {
        href: string;
        text: string;
    }[];
    screenshot: string | null;
    error?: string;
}

/**
 * Generates mock data for development and testing
 */
function getMockData(url: string): FirecrawlResponse {
    return {
        url,
        title: 'Mock Website Title',
        headings: [
            { tag: 'h1', text: 'Main Heading', level: 1 },
            { tag: 'h2', text: 'Subheading 1', level: 2 },
            { tag: 'h2', text: 'Subheading 2', level: 2 },
            { tag: 'h3', text: 'Section 1', level: 3 },
            { tag: 'h3', text: 'Section 2', level: 3 },
        ],
        links: [
            { href: 'https://example.com', text: 'Example Link' },
            { href: 'https://example.com/about', text: 'About Us' },
            { href: 'https://example.com/contact', text: 'Contact' },
            { href: 'https://example.com/broken', text: 'Broken Link' },
            { href: 'https://example.com/products', text: 'Products' },
        ],
        screenshot:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    };
}

/**
 * Scrapes a website using Firecrawl API
 * @param url The URL to scrape
 * @returns Scraped data or null if error
 */
export async function scrapeWebsite(
    url: string
): Promise<FirecrawlResponse | null> {
    try {
        // Validate URL before sending to API
        if (!isValidUrl(url)) {
            throw new Error('Invalid URL format');
        }

        // Use mock data if API key is missing or in development mode
        if (USE_MOCK_DATA) {
            console.log('Using mock data for scraping:', url);
            return getMockData(url);
        }

        const response = await axios.post(
            `${API_URL}/scrape`,
            { url, includeScreenshot: true },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
            }
        );

        if (response.status !== 200) {
            throw new Error(`API returned status code ${response.status}`);
        }

        // Process headings to add level property based on tag
        const processedData = {
            ...response.data,
            headings: response.data.headings.map((heading: any) => ({
                ...heading,
                level: parseInt(heading.tag.replace('h', ''), 10) || 0,
            })),
        };

        return processedData;
    } catch (error: any) {
        console.error('Error scraping website:', error.message);

        // If we're in development mode, return mock data instead of failing
        if (process.env.NODE_ENV === 'development') {
            console.log('Falling back to mock data due to API error');
            return getMockData(url);
        }

        return {
            url,
            title: null,
            headings: [],
            links: [],
            screenshot: null,
            error: error.message || 'Failed to scrape website',
        };
    }
}

/**
 * Checks if links are broken
 * @param links Array of URLs to check
 * @returns Array of links with isBroken flag
 */
export async function checkBrokenLinks(
    links: string[]
): Promise<{ url: string; isBroken: boolean }[]> {
    try {
        // Use mock data if API key is missing or in development mode
        if (USE_MOCK_DATA) {
            console.log('Using mock data for checking broken links');
            return links.map((url) => ({
                url,
                // Mark some links as broken for testing
                isBroken: url.includes('broken') || Math.random() < 0.2,
            }));
        }

        const response = await axios.post(
            `${API_URL}/check-links`,
            { links },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
            }
        );

        if (response.status !== 200) {
            throw new Error(`API returned status code ${response.status}`);
        }

        return response.data.results;
    } catch (error: any) {
        console.error('Error checking broken links:', error.message);

        // If we're in development mode, return mock data
        if (process.env.NODE_ENV === 'development') {
            return links.map((url) => ({
                url,
                isBroken: url.includes('broken') || Math.random() < 0.2,
            }));
        }

        // Return all links as not broken if the API call fails
        return links.map((url) => ({ url, isBroken: false }));
    }
}

/**
 * Analyzes website for basic issues using Firecrawl's LLM integration
 * @param scrapedData The scraped website data
 * @returns Array of issues found
 */
export async function analyzeWebsiteIssues(
    scrapedData: FirecrawlResponse
): Promise<
    { type: string; description: string; severity?: string; element?: string }[]
> {
    try {
        // Use mock data if API key is missing or in development mode
        if (USE_MOCK_DATA) {
            console.log('Using mock data for website analysis');
            return [
                {
                    type: 'Missing Meta Description',
                    description:
                        'The page is missing a meta description which is important for SEO.',
                    severity: 'medium',
                },
                {
                    type: 'Broken Link',
                    description:
                        'The page contains at least one broken link that should be fixed.',
                    severity: 'high',
                    element:
                        '<a href="https://example.com/broken">Broken Link</a>',
                },
                {
                    type: 'Accessibility Issue',
                    description:
                        'Images are missing alt text which affects screen reader users.',
                    severity: 'medium',
                    element: '<img src="image.jpg">',
                },
            ];
        }

        const response = await axios.post(
            `${API_URL}/analyze`,
            {
                url: scrapedData.url,
                title: scrapedData.title,
                headings: scrapedData.headings,
                links: scrapedData.links,
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
            }
        );

        if (response.status !== 200) {
            throw new Error(`API returned status code ${response.status}`);
        }

        return response.data.issues || [];
    } catch (error: any) {
        console.error('Error analyzing website:', error.message);

        // If we're in development mode, return mock issues
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    type: 'API Error',
                    description: `Could not analyze website: ${error.message}`,
                    severity: 'low',
                },
                {
                    type: 'Missing Meta Description',
                    description:
                        'The page is missing a meta description which is important for SEO.',
                    severity: 'medium',
                },
                {
                    type: 'Broken Link',
                    description:
                        'The page contains at least one broken link that should be fixed.',
                    severity: 'high',
                },
            ];
        }

        return [
            {
                type: 'error',
                description: `Failed to analyze website: ${
                    error.message || 'Unknown error'
                }`,
                severity: 'high',
            },
        ];
    }
}
