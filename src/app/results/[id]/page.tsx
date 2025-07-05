"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrapingResultDisplay } from "@/components/scraping-result";
import { getScrapedDataById } from "@/lib/supabase/client";
import { ScrapingResult } from "@/types";

export default function ResultDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<ScrapingResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchScrapedData() {
            try {
                if (!params.id) {
                    throw new Error("No ID provided");
                }

                setIsLoading(true);
                const data = await getScrapedDataById(params.id as string);

                if (!data) {
                    throw new Error("Result not found");
                }

                setResult(data);
            } catch (err: any) {
                console.error("Error fetching scraped data:", err);
                setError(err.message || "Failed to load result");
            } finally {
                setIsLoading(false);
            }
        }

        fetchScrapedData();
    }, [params.id]);

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center space-x-1"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Back
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push("/history")}
                    >
                        View All Results
                    </Button>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <svg
                            className="animate-spin h-12 w-12 text-primary mb-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <p className="text-center text-muted-foreground">
                            Loading result...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-md text-center">
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p>{error}</p>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="mt-4"
                        >
                            Return Home
                        </Button>
                    </div>
                )}

                {!isLoading && !error && result && (
                    <ScrapingResultDisplay result={result} isSaved={true} />
                )}
            </div>
        </main>
    );
} 