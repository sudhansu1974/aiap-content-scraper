import puppeteer, { Browser, Page } from 'puppeteer';
import chromium from '@sparticuz/chromium';
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

// Cache browser instance for better performance
let browserInstance: Browser | null = null;

/**
 * Gets a browser instance, creating one if it doesn't exist
 */
async function getBrowser(): Promise<Browser> {
    if (!browserInstance) {
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            // Use @sparticuz/chromium for serverless environments
            browserInstance = await puppeteer.launch({
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--single-process',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        } else {
            // Use regular puppeteer for local development
            browserInstance = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
        }
    }
    return browserInstance;
}

/**
 * Scrapes a website using Puppeteer
 * @param url The URL to scrape
 * @returns Scraped data
 */
export async function scrapeWebsite(url: string): Promise<ScrapedData> {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        // Validate URL before proceeding
        if (!isValidUrl(url)) {
            throw new Error('Invalid URL format');
        }

        console.log('Scraping website:', url);
        browser = await getBrowser();
        page = await browser.newPage();

        // Set viewport for consistent screenshots
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to the URL with timeout
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        // Extract page title
        const title = await page.title();

        // Extract headings
        const headings = await page.evaluate(() => {
            const headingElements = document.querySelectorAll(
                'h1, h2, h3, h4, h5, h6'
            );
            return Array.from(headingElements).map((el) => {
                const tag = el.tagName.toLowerCase();
                return {
                    tag,
                    text: el.textContent?.trim() || '',
                    level: parseInt(tag.replace('h', ''), 10),
                };
            });
        });

        // Extract links
        const links = await page.evaluate(() => {
            const linkElements = document.querySelectorAll('a');
            return Array.from(linkElements)
                .filter((el) => el.href && el.href.startsWith('http'))
                .map((el) => ({
                    href: el.href,
                    text: el.textContent?.trim() || el.href,
                }));
        });

        // Take a screenshot
        const screenshot = await page.screenshot({
            fullPage: true,
            encoding: 'base64',
        });

        // Don't close the browser, just the page
        if (page) await page.close();

        return {
            url,
            title,
            headings,
            links,
            screenshot: `data:image/png;base64,${screenshot}`,
        };
    } catch (error: any) {
        console.error('Error scraping website:', error.message);

        // Close the page if it exists
        if (page) await page.close();

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
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
        browser = await getBrowser();
        page = await browser.newPage();

        // Set a short timeout for checking links
        await page.setDefaultNavigationTimeout(10000);

        const results = [];

        // Check each link (with concurrency limit)
        const concurrencyLimit = 5;
        const chunks = [];

        // Split links into chunks for concurrent processing
        for (let i = 0; i < links.length; i += concurrencyLimit) {
            chunks.push(links.slice(i, i + concurrencyLimit));
        }

        // Process each chunk
        for (const chunk of chunks) {
            const chunkPromises = chunk.map(async (url) => {
                try {
                    const response = await page.goto(url, {
                        waitUntil: 'networkidle2',
                    });
                    const isBroken = !response || response.status() >= 400;
                    return { url, isBroken };
                } catch (error) {
                    return { url, isBroken: true };
                }
            });

            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);
        }

        // Don't close the browser, just the page
        if (page) await page.close();

        return results;
    } catch (error: any) {
        console.error('Error checking broken links:', error.message);

        // Close the page if it exists
        if (page) await page.close();

        // Return all links as not broken if the process fails
        return links.map((url) => ({ url, isBroken: false }));
    }
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
                    'The page title is very short. Consider using a more descriptive title.',
                severity: 'medium',
                element: `<title>${scrapedData.title}</title>`,
            });
        }

        // Check for missing headings
        if (scrapedData.headings.length === 0) {
            issues.push({
                type: 'No Headings',
                description:
                    'The page has no headings which makes it difficult to understand the content structure.',
                severity: 'medium',
            });
        }

        // Check for missing H1
        if (!scrapedData.headings.some((h) => h.level === 1)) {
            issues.push({
                type: 'Missing H1',
                description:
                    'The page is missing an H1 heading which is important for SEO and content hierarchy.',
                severity: 'medium',
            });
        }

        // Check for too many H1s
        const h1Count = scrapedData.headings.filter(
            (h) => h.level === 1
        ).length;
        if (h1Count > 1) {
            issues.push({
                type: 'Multiple H1 Headings',
                description: `The page has ${h1Count} H1 headings. It's best practice to have only one main H1 heading.`,
                severity: 'low',
            });
        }

        // Check for broken links
        const brokenLinks = scrapedData.links.filter(
            (link: any) => link.isBroken
        );
        if (brokenLinks.length > 0) {
            issues.push({
                type: 'Broken Links',
                description: `The page contains ${brokenLinks.length} broken links that should be fixed.`,
                severity: 'high',
                element:
                    brokenLinks.length > 0
                        ? `<a href="${brokenLinks[0].href}">${brokenLinks[0].text}</a>`
                        : undefined,
            });
        }

        // Check for empty links
        const emptyLinks = scrapedData.links.filter(
            (link) => !link.text || link.text.trim() === ''
        );
        if (emptyLinks.length > 0) {
            issues.push({
                type: 'Empty Link Text',
                description: `The page contains ${emptyLinks.length} links with no text which is bad for accessibility.`,
                severity: 'medium',
                element:
                    emptyLinks.length > 0
                        ? `<a href="${emptyLinks[0].href}"></a>`
                        : undefined,
            });
        }

        return issues;
    } catch (error: any) {
        console.error('Error analyzing website:', error.message);
        return [
            {
                type: 'Analysis Error',
                description: `Failed to analyze website: ${
                    error.message || 'Unknown error'
                }`,
                severity: 'high',
            },
        ];
    }
}

/**
 * Cleanup function to close the browser when the app is shutting down
 */
export async function closeBrowser(): Promise<void> {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

// Handle process termination to clean up resources
process.on('exit', () => {
    if (browserInstance) {
        browserInstance.close().catch(console.error);
    }
});
