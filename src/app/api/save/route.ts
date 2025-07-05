import { NextRequest, NextResponse } from 'next/server';
import { saveScrapedData } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const data = await request.json();

        // Validate required fields
        if (!data.url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Save data to Supabase
        const savedData = await saveScrapedData({
            url: data.url,
            title: data.title || null,
            headings: data.headings || [],
            links: data.links || [],
            screenshot: data.screenshot || null,
            issues: data.issues || [],
        });

        if (!savedData) {
            return NextResponse.json(
                { error: 'Failed to save data' },
                { status: 500 }
            );
        }

        // Return success response
        return NextResponse.json({
            success: true,
            data: savedData,
        });
    } catch (error: any) {
        console.error('Error in save API:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
