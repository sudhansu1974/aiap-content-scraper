import { NextRequest, NextResponse } from 'next/server';
import { analyzeContent } from '@/lib/ai/content-analyzer';
import { ScrapedData } from '@/lib/puppeteer/client';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const data = await request.json();

        // Validate required fields
        if (!data.url || !data.title) {
            return NextResponse.json(
                { error: 'URL and title are required' },
                { status: 400 }
            );
        }

        // Convert the request data to the expected format
        const scrapedData: ScrapedData = {
            url: data.url,
            title: data.title,
            headings: data.headings || [],
            links: data.links || [],
            screenshot: data.screenshot || null,
            error: undefined,
        };

        // Perform content analysis
        const analysis = await analyzeContent(scrapedData);

        // Return the analysis
        return NextResponse.json({
            success: true,
            analysis,
        });
    } catch (error: any) {
        console.error('Error in analyze API:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
 