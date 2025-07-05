import FirecrawlApp from '@mendable/firecrawl-js';
import { isValidUrl } from '../utils';

// Types for scraped data
export interface ScrapedData {
    url: string;
    title: string | null;
    headings: {
        tag: string;
        text: string;
        level: number;
    }[];
    links: {
        href: string;
        text: string;
    }[];
    screenshot: string | null;
    error?: string;
}

// Firecrawl client will be initialized per request to ensure environment variables are available

/**
 * Scrapes a website using Firecrawl
 * @param url The URL to scrape
 * @returns Scraped data
 */
export async function scrapeWebsite(url: string): Promise<ScrapedData> {
    try {
        // Validate URL before proceeding
        if (!isValidUrl(url)) {
            throw new Error('Invalid URL format');
        }

        console.log('Scraping website with Firecrawl:', url);

        // Check for API key
        if (!process.env.FIRECRAWL_API_KEY) {
            throw new Error(
                'FIRECRAWL_API_KEY environment variable is not set'
            );
        }

        // Initialize Firecrawl client per request to ensure env vars are available
        const firecrawlApp = new FirecrawlApp({
            apiKey: process.env.FIRECRAWL_API_KEY,
            apiUrl:
                process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev',
        });

        console.log(
            'Firecrawl API URL:',
            process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev'
        );

        // Scrape the website using Firecrawl with timeout for Vercel
        const scrapeResult = await Promise.race([
            firecrawlApp.scrapeUrl(url, {
                formats: ['markdown', 'html', 'screenshot@fullPage'],
                includeTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'],
                onlyMainContent: false,
                waitFor: 3000,
                timeout: 25000, // 25 seconds timeout for Vercel
            }),
            new Promise((_, reject) =>
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                'Request timeout - Vercel function limit reached'
                            )
                        ),
                    28000
                )
            ),
        ]);

        // Debug logging (can be removed in production)
        // console.log('Full Firecrawl response:', JSON.stringify(scrapeResult, null, 2));

        // Check if we received an HTML error page instead of JSON
        if (
            typeof scrapeResult === 'string' &&
            scrapeResult.includes('<html')
        ) {
            throw new Error(
                'Received HTML error page from Firecrawl API - check API key and rate limits'
            );
        }

        // Handle different response formats
        let data;
        if (scrapeResult.success === false) {
            const errorMsg = scrapeResult.error || 'Failed to scrape website';
            console.error('Firecrawl API error:', errorMsg);
            throw new Error(errorMsg);
        }

        // Handle different response structures
        if (scrapeResult.data) {
            data = scrapeResult.data;
        } else if (
            scrapeResult.markdown ||
            scrapeResult.html ||
            scrapeResult.metadata
        ) {
            // Direct response format
            data = scrapeResult;
        } else {
            console.error(
                'Unexpected Firecrawl response structure:',
                scrapeResult
            );
            throw new Error('Unexpected response format from Firecrawl');
        }

        // Debug logging (can be removed in production)
        // console.log('Processed data structure:', {
        //     hasData: !!data,
        //     dataKeys: data ? Object.keys(data) : [],
        //     hasMetadata: !!data?.metadata,
        //     metadataKeys: data?.metadata ? Object.keys(data.metadata) : [],
        //     hasMarkdown: !!data?.markdown,
        //     hasHtml: !!data?.html,
        //     hasScreenshot: !!data?.screenshot,
        // });

        // Extract title - handle both direct access and nested metadata
        const title = data.metadata?.title || data.title || null;

        // Extract headings from the structured data
        const headings = extractHeadings(data.html || '');

        // Extract links from the structured data
        const links = extractLinks(data.html || '', url);

        // Get screenshot if available - handle different response formats
        const screenshot =
            data.screenshot || data.actions?.screenshots?.[0] || null;

        return {
            url,
            title,
            headings,
            links,
            screenshot,
        };
    } catch (error: any) {
        console.error('Error scraping website with Firecrawl:', error.message);

        // Provide more specific error messages for common issues
        let errorMessage = error.message || 'Failed to scrape website';

        if (error.message?.includes('Unexpected token')) {
            errorMessage =
                'Firecrawl API returned invalid response - likely an authentication or rate limit issue';
        } else if (error.message?.includes('API key')) {
            errorMessage = 'Invalid or missing Firecrawl API key';
        } else if (error.message?.includes('timeout')) {
            errorMessage =
                'Request timed out - website may be slow or unavailable';
        } else if (error.message?.includes('rate limit')) {
            errorMessage =
                'Firecrawl API rate limit exceeded - please try again later';
        }

        return {
            url,
            title: null,
            headings: [],
            links: [],
            screenshot: null,
            error: errorMessage,
        };
    }
}

/**
 * Extract headings from HTML content
 */
function extractHeadings(
    html: string
): { tag: string; text: string; level: number }[] {
    const headings: { tag: string; text: string; level: number }[] = [];
    const headingRegex = /<(h[1-6])[^>]*>(.*?)<\/\1>/gi;
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
        const tag = match[1].toLowerCase();
        const text = match[2].replace(/<[^>]*>/g, '').trim();
        const level = parseInt(tag.replace('h', ''), 10);

        if (text) {
            headings.push({ tag, text, level });
        }
    }

    return headings;
}

/**
 * Extract links from HTML content
 */
function extractLinks(
    html: string,
    baseUrl: string
): { href: string; text: string }[] {
    const links: { href: string; text: string }[] = [];
    const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
        let href = match[1];
        const text = match[2].replace(/<[^>]*>/g, '').trim();

        // Convert relative URLs to absolute URLs
        if (href.startsWith('/')) {
            const baseUrlObj = new URL(baseUrl);
            href = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`;
        } else if (href.startsWith('./')) {
            const baseUrlObj = new URL(baseUrl);
            href = `${baseUrlObj.protocol}//${baseUrlObj.host}${
                baseUrlObj.pathname
            }${href.substring(2)}`;
        }

        // Only include http/https links
        if (href.startsWith('http') && text) {
            links.push({ href, text });
        }
    }

    return links;
}

/**
 * Checks if links are broken
 * @param links Array of URLs to check
 * @returns Array of links with isBroken flag
 */
export async function checkBrokenLinks(
    links: string[]
): Promise<{ url: string; isBroken: boolean }[]> {
    const results: { url: string; isBroken: boolean }[] = [];

    // Process links in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < links.length; i += batchSize) {
        const batch = links.slice(i, i + batchSize);
        const batchPromises = batch.map(async (url) => {
            try {
                const response = await fetch(url, {
                    method: 'HEAD',
                    timeout: 10000,
                });
                return { url, isBroken: !response.ok };
            } catch (error) {
                return { url, isBroken: true };
            }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }

    return results;
}

/**
 * Analyzes website for basic issues
 * @param scrapedData The scraped website data
 * @returns Array of issues found
 */
export async function analyzeWebsiteIssues(
    scrapedData: ScrapedData
): Promise<
    { type: string; description: string; severity: string; element?: string }[]
> {
    const issues: {
        type: string;
        description: string;
        severity: string;
        element?: string;
    }[] = [];

    try {
        // Check for missing title
        if (!scrapedData.title || scrapedData.title.trim() === '') {
            issues.push({
                type: 'Missing Title',
                description:
                    'The page is missing a title which is important for SEO and accessibility.',
                severity: 'high',
            });
        }

        // Check for short title
        if (scrapedData.title && scrapedData.title.length < 10) {
            issues.push({
                type: 'Short Title',
                description:
                    'The page title is too short. Consider making it more descriptive.',
                severity: 'medium',
                element: scrapedData.title,
            });
        }

        // Check for long title
        if (scrapedData.title && scrapedData.title.length > 60) {
            issues.push({
                type: 'Long Title',
                description:
                    'The page title is too long and may be truncated in search results.',
                severity: 'medium',
                element: scrapedData.title,
            });
        }

        // Check for missing H1
        const h1Count = scrapedData.headings.filter(
            (h) => h.level === 1
        ).length;
        if (h1Count === 0) {
            issues.push({
                type: 'Missing H1',
                description:
                    'The page is missing an H1 heading which is important for SEO.',
                severity: 'high',
            });
        }

        // Check for multiple H1s
        if (h1Count > 1) {
            issues.push({
                type: 'Multiple H1s',
                description:
                    'The page has multiple H1 headings. Consider using only one H1 per page.',
                severity: 'medium',
            });
        }

        // Check for heading hierarchy
        const headingLevels = scrapedData.headings.map((h) => h.level);
        for (let i = 1; i < headingLevels.length; i++) {
            if (headingLevels[i] > headingLevels[i - 1] + 1) {
                issues.push({
                    type: 'Heading Hierarchy',
                    description:
                        'Heading levels should not skip levels (e.g., H1 directly to H3).',
                    severity: 'medium',
                });
                break;
            }
        }

        // Check for empty headings
        const emptyHeadings = scrapedData.headings.filter(
            (h) => h.text.trim() === ''
        );
        if (emptyHeadings.length > 0) {
            issues.push({
                type: 'Empty Headings',
                description: `Found ${emptyHeadings.length} empty heading(s). All headings should have descriptive text.`,
                severity: 'medium',
            });
        }

        // Check for links without text
        const emptyLinks = scrapedData.links.filter(
            (link) => !link.text || link.text.trim() === ''
        );
        if (emptyLinks.length > 0) {
            issues.push({
                type: 'Empty Links',
                description: `Found ${emptyLinks.length} link(s) without descriptive text.`,
                severity: 'medium',
            });
        }

        // Check for "click here" or similar non-descriptive link text
        const nonDescriptiveLinks = scrapedData.links.filter((link) =>
            /^(click here|here|read more|more|link)$/i.test(link.text.trim())
        );
        if (nonDescriptiveLinks.length > 0) {
            issues.push({
                type: 'Non-descriptive Links',
                description: `Found ${nonDescriptiveLinks.length} link(s) with non-descriptive text like "click here".`,
                severity: 'low',
            });
        }

        console.log(`Found ${issues.length} issues for ${scrapedData.url}`);
        return issues;
    } catch (error: any) {
        console.error('Error analyzing website issues:', error.message);
        return [];
    }
}

/**
 * Clean up resources (not needed for Firecrawl, but keeping for compatibility)
 */
export async function closeBrowser(): Promise<void> {
    // No cleanup needed for Firecrawl
    console.log('Firecrawl client cleanup completed');
}
