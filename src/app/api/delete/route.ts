import { NextRequest, NextResponse } from 'next/server';
import {
    deleteScrapedData,
    deleteMultipleScrapedData,
} from '@/lib/supabase/client';

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ids } = body;

        if (!id && (!ids || !Array.isArray(ids))) {
            return NextResponse.json(
                { error: 'Missing id or ids parameter' },
                { status: 400 }
            );
        }

        let success = false;

        if (id) {
            // Delete single record
            success = await deleteScrapedData(id);
        } else if (ids && ids.length > 0) {
            // Delete multiple records
            success = await deleteMultipleScrapedData(ids);
        }

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete scraped data' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in delete API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
