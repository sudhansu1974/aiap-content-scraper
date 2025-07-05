"use client";

import { useEffect, useState } from "react";
import { HistoryList } from "@/components/history-list";
import { getAllScrapedData } from "@/lib/supabase/client";
import { ScrapingResult } from "@/types";

export default function HistoryPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [scrapedItems, setScrapedItems] = useState<ScrapingResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchScrapedData = async () => {
        try {
            setIsLoading(true);
            const data = await getAllScrapedData();
            setScrapedItems(data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching scraped data:", err);
            setError(err.message || "Failed to load history");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchScrapedData();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold">Scraping History</h1>
                    <p className="text-muted-foreground">
                        View all your previously scraped websites
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <HistoryList
                    items={scrapedItems}
                    isLoading={isLoading}
                    onItemsDeleted={fetchScrapedData}
                />
            </div>
        </main>
    );
} 