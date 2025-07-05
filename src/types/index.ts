import { z } from 'zod';

// URL validation schema
export const urlSchema = z.string().url({
    message: 'Please enter a valid URL (e.g., https://example.com)',
});

// Schema for form data
export const urlFormSchema = z.object({
    url: urlSchema,
});

export type UrlFormData = z.infer<typeof urlFormSchema>;

// Types for scraped content
export interface Heading {
    tag: string;
    text: string;
}

export interface Link {
    href: string;
    text: string;
    isBroken: boolean;
}

export interface Issue {
    type: string;
    description: string;
}

export interface ScrapingResult {
    url: string;
    title: string | null;
    headings: Heading[];
    links: Link[];
    screenshot: string | null;
    issues: Issue[];
    createdAt: string;
    id: string;
}

// Status for scraping process
export type ScrapingStatus = 'idle' | 'loading' | 'success' | 'error';
