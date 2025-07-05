import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind's merge utility
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Validates a URL string
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Formats a date into a human-readable string
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date);
}

/**
 * Truncates a string to a specified length
 */
export function truncateString(str: string, length: number): string {
    if (str.length <= length) return str;
    return `${str.slice(0, length)}...`;
}

/**
 * Generates a random ID
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}
