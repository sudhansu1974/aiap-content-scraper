import { NextRequest, NextResponse } from 'next/server';
import {
    scrapeWebsite,
    analyzeWebsiteIssues,
    checkBrokenLinks,
} from '@/lib/firecrawl/client';
import { saveScrapedData } from '@/lib/supabase/client';
import { urlSchema } from '@/types';

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        // Validate URL
        const result = urlSchema.safeParse(body.url);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        const url = body.url;
        console.log('Processing scrape request for:', url);

        // 1. Scrape the website using Firecrawl
        const scrapedData = await scrapeWebsite(url);

        if (!scrapedData || scrapedData.error) {
            return NextResponse.json(
                { error: scrapedData?.error || 'Failed to scrape website' },
                { status: 500 }
            );
        }

        // 2. Check for broken links
        const linkUrls = scrapedData.links.map((link) => link.href);
        const brokenLinksResult = await checkBrokenLinks(linkUrls);

        // Create a map of URL to broken status for quick lookup
        const brokenLinksMap = brokenLinksResult.reduce(
            (acc, { url, isBroken }) => {
                acc[url] = isBroken;
                return acc;
            },
            {} as Record<string, boolean>
        );

        // Enhance links with broken status
        const enhancedLinks = scrapedData.links.map((link) => ({
            ...link,
            isBroken: brokenLinksMap[link.href] || false,
        }));

        // Update scraped data with enhanced links
        const enhancedData = {
            ...scrapedData,
            links: enhancedLinks,
        };

        // 3. Analyze for issues
        const issues = await analyzeWebsiteIssues(enhancedData);

        // 4. Save to database if requested
        let savedData = null;
        if (body.save === true) {
            savedData = await saveScrapedData({
                url,
                title: scrapedData.title,
                headings: scrapedData.headings,
                links: enhancedLinks,
                screenshot: scrapedData.screenshot,
                issues,
            });
        }

        // 5. Return the result
        return NextResponse.json({
            url,
            title: scrapedData.title,
            headings: scrapedData.headings,
            links: enhancedLinks,
            screenshot: scrapedData.screenshot,
            issues,
            id: savedData?.id || null,
            createdAt: savedData?.createdAt || new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error in scrape API:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// Rate limiting and validation middleware could be added here
