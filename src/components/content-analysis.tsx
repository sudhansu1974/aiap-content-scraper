"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart2, BookOpen, MessageSquare, Lightbulb } from "lucide-react";
import { ContentAnalysis } from "@/lib/ai/content-analyzer";

interface ContentAnalysisProps {
    scrapedData: any;
}

export function ContentAnalysisDisplay({ scrapedData }: ContentAnalysisProps) {
    const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"summary" | "readability" | "keywords" | "suggestions">("summary");

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scrapedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to analyze content");
            }

            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (err: any) {
            console.error("Error analyzing content:", err);
            setError(err.message || "Failed to analyze content");
        } finally {
            setIsLoading(false);
        }
    };

    // Format readability score as a percentage
    const formatReadabilityScore = (score: number) => {
        return `${Math.round(score)}%`;
    };

    // Get color based on sentiment score
    const getSentimentColor = (score: number) => {
        if (score > 0.3) return "text-green-500";
        if (score > 0) return "text-green-400";
        if (score > -0.3) return "text-gray-500";
        return "text-red-500";
    };

    return (
        <Card className="w-full">
            <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                <CardTitle className="text-xl">AI Content Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {!analysis && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-violet-100 dark:bg-violet-900/20 p-3 rounded-full mb-4">
                            <BarChart2 className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">
                            Generate AI-powered insights about the content of this page
                        </p>
                        <Button onClick={handleAnalyze} className="bg-violet-600 hover:bg-violet-700">
                            Analyze Content
                        </Button>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-600 dark:text-violet-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">Analyzing content...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
                        <p className="flex items-center">
                            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </p>
                        <Button onClick={handleAnalyze} variant="outline" size="sm" className="mt-4">
                            Try Again
                        </Button>
                    </div>
                )}

                {analysis && (
                    <div className="space-y-4">
                        <div className="flex border-b dark:border-gray-700">
                            <button
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "summary"
                                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                onClick={() => setActiveTab("summary")}
                            >
                                <div className="flex items-center">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Summary
                                </div>
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "readability"
                                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                onClick={() => setActiveTab("readability")}
                            >
                                <div className="flex items-center">
                                    <BarChart2 className="h-4 w-4 mr-2" />
                                    Readability
                                </div>
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "keywords"
                                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                onClick={() => setActiveTab("keywords")}
                            >
                                <div className="flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Keywords
                                </div>
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "suggestions"
                                    ? "border-violet-600 text-violet-600 dark:text-violet-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                                onClick={() => setActiveTab("suggestions")}
                            >
                                <div className="flex items-center">
                                    <Lightbulb className="h-4 w-4 mr-2" />
                                    Suggestions
                                </div>
                            </button>
                        </div>

                        {activeTab === "summary" && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Content Summary</h3>
                                    <p className="text-gray-700 dark:text-gray-300">{analysis.summary}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Readability</h4>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{analysis.readabilityLevel}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sentiment</h4>
                                        <p className={`text-lg font-semibold ${getSentimentColor(analysis.sentimentScore)}`}>
                                            {analysis.sentimentAnalysis}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "readability" && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Readability Score</h3>
                                        <span className={`text-lg font-bold ${analysis.readabilityScore < 40 ? "text-green-500" :
                                            analysis.readabilityScore < 70 ? "text-yellow-500" : "text-red-500"
                                            }`}>
                                            {formatReadabilityScore(analysis.readabilityScore)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${analysis.readabilityScore < 40 ? "bg-green-500" :
                                                analysis.readabilityScore < 70 ? "bg-yellow-500" : "bg-red-500"
                                                }`}
                                            style={{ width: `${analysis.readabilityScore}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-4 text-gray-700 dark:text-gray-300">
                                        {analysis.readabilityLevel === 'Easy' && 'This content is easy to read and understand, suitable for a general audience.'}
                                        {analysis.readabilityLevel === 'Medium' && 'This content has moderate complexity, suitable for an average reader.'}
                                        {analysis.readabilityLevel === 'Hard' && 'This content is complex and may be difficult for some readers to understand.'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Sentiment Analysis</h3>
                                    <div className="flex items-center mb-4">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${analysis.sentimentScore > 0.3 ? "bg-green-500" :
                                                    analysis.sentimentScore > 0 ? "bg-green-400" :
                                                        analysis.sentimentScore > -0.3 ? "bg-gray-500" : "bg-red-500"
                                                    }`}
                                                style={{ width: `${(analysis.sentimentScore + 1) * 50}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <p className={`text-lg font-semibold ${getSentimentColor(analysis.sentimentScore)}`}>
                                        {analysis.sentimentAnalysis}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === "keywords" && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Top Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.topKeywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 rounded-full text-sm"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Keyword Density</h3>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                        {Object.entries(analysis.keywordDensity)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 10)
                                            .map(([keyword, density], index) => (
                                                <div key={index} className="flex items-center">
                                                    <span className="text-gray-700 dark:text-gray-300 w-1/3">{keyword}</span>
                                                    <div className="w-2/3">
                                                        <div className="flex items-center">
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                                                <div
                                                                    className="bg-violet-500 h-2 rounded-full"
                                                                    style={{ width: `${Math.min(density * 5, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                                                                {density.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "suggestions" && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Content Improvement Suggestions</h3>
                                <ul className="space-y-3">
                                    {analysis.suggestions.map((suggestion, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg className="h-5 w-5 text-violet-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 