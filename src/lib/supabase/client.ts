import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ScrapedData = {
    id: string;
    url: string;
    title: string | null;
    headings: {
        tag: string;
        text: string;
    }[];
    links: {
        href: string;
        text: string;
        isBroken: boolean;
    }[];
    screenshot: string | null;
    createdAt: string;
    issues: {
        type: string;
        description: string;
    }[];
};

/**
 * Saves scraped data to Supabase
 */
export async function saveScrapedData(
    data: Omit<ScrapedData, 'id' | 'createdAt'>
): Promise<ScrapedData | null> {
    try {
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        const { data: savedData, error } = await supabase
            .from('scraped_data')
            .insert([{ id, ...data, created_at: createdAt }])
            .select()
            .single();

        if (error) {
            console.error('Error saving scraped data:', error);
            return null;
        }

        return {
            ...savedData,
            createdAt: savedData.created_at,
            headings: savedData.headings || [],
            links: savedData.links || [],
            issues: savedData.issues || [],
        } as ScrapedData;
    } catch (error) {
        console.error('Error saving scraped data:', error);
        return null;
    }
}

/**
 * Gets all scraped data from Supabase
 */
export async function getAllScrapedData(): Promise<ScrapedData[]> {
    try {
        const { data, error } = await supabase
            .from('scraped_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching scraped data:', error);
            return [];
        }

        return data.map((item) => ({
            ...item,
            createdAt: item.created_at,
            headings: item.headings || [],
            links: item.links || [],
            issues: item.issues || [],
        })) as ScrapedData[];
    } catch (error) {
        console.error('Error fetching scraped data:', error);
        return [];
    }
}

/**
 * Gets scraped data by ID from Supabase
 */
export async function getScrapedDataById(
    id: string
): Promise<ScrapedData | null> {
    try {
        const { data, error } = await supabase
            .from('scraped_data')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Error fetching scraped data by ID:', error);
            return null;
        }

        return {
            ...data,
            createdAt: data.created_at,
            headings: data.headings || [],
            links: data.links || [],
            issues: data.issues || [],
        } as ScrapedData;
    } catch (error) {
        console.error('Error fetching scraped data by ID:', error);
        return null;
    }
}

/**
 * Deletes scraped data by ID from Supabase
 */
export async function deleteScrapedData(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('scraped_data')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting scraped data:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting scraped data:', error);
        return false;
    }
}

/**
 * Deletes multiple scraped data records by IDs from Supabase
 */
export async function deleteMultipleScrapedData(
    ids: string[]
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('scraped_data')
            .delete()
            .in('id', ids);

        if (error) {
            console.error('Error deleting multiple scraped data:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting multiple scraped data:', error);
        return false;
    }
}
