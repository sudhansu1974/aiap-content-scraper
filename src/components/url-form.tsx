"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const urlSchema = z.object({
    url: z
        .string()
        .trim()
        .min(1, "URL is required")
        .url("Please enter a valid URL")
        .refine(
            (url) => {
                try {
                    new URL(url);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            { message: "Please enter a valid URL" }
        ),
});

type UrlFormProps = {
    onSubmit: (url: string) => void;
    isLoading: boolean;
};

export function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
    const [recentUrls, setRecentUrls] = useState<string[]>([]);
    const [showRecentUrls, setShowRecentUrls] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<{ url: string }>({
        resolver: zodResolver(urlSchema),
        defaultValues: {
            url: "",
        },
    });

    const urlValue = watch("url");

    // Load recent URLs from localStorage on component mount
    useEffect(() => {
        const savedUrls = localStorage.getItem("recentUrls");
        if (savedUrls) {
            setRecentUrls(JSON.parse(savedUrls));
        }
    }, []);

    // Save URL to recent URLs
    const saveToRecentUrls = (url: string) => {
        const updatedUrls = [url, ...recentUrls.filter(u => u !== url)].slice(0, 5);
        setRecentUrls(updatedUrls);
        localStorage.setItem("recentUrls", JSON.stringify(updatedUrls));
    };

    const handleFormSubmit = (data: { url: string }) => {
        // Ensure URL has protocol
        let formattedUrl = data.url;
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
            formattedUrl = "https://" + formattedUrl;
        }

        // Save to recent URLs
        saveToRecentUrls(formattedUrl);

        // Submit the URL
        onSubmit(formattedUrl);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setValue("url", text);
            }
        } catch (err) {
            console.error("Failed to read clipboard:", err);
        }
    };

    const handleClear = () => {
        reset();
    };

    const handleSelectRecentUrl = (url: string) => {
        setValue("url", url);
        setShowRecentUrls(false);
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                {...register("url")}
                                placeholder="Enter website URL (e.g., https://example.com)"
                                className={`pr-10 ${errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                onFocus={() => recentUrls.length > 0 && setShowRecentUrls(true)}
                                onBlur={() => setTimeout(() => setShowRecentUrls(false), 200)}
                            />
                            {urlValue && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}

                            {showRecentUrls && recentUrls.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Recent URLs</div>
                                    {recentUrls.map((url, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelectRecentUrl(url)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                                        >
                                            {url}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePaste}
                            className="flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            Paste
                        </Button>
                    </div>
                </div>

                {errors.url && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.url.message}
                    </p>
                )}

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Extracting Content...
                            </>
                        ) : (
                            <>
                                <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                Extract Content
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>Enter any website URL to extract its content, headings, links, and take a screenshot.</p>
            </div>
        </div>
    );
} 