"use client";

import Image from "next/image";
import { useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrapingResult } from "@/types";
import { formatDate } from "@/lib/utils";
import { analyzeContent, ContentAnalysis } from "@/lib/ai/content-analyzer";
import { Loader2, BarChart2, BookOpen, MessageSquare, Lightbulb } from "lucide-react";

interface ScrapingResultProps {
    result: ScrapingResult;
    onSave?: () => void;
    isSaving?: boolean;
    isSaved?: boolean;
}

export function ScrapingResultDisplay({
    result,
    onSave,
    isSaving = false,
    isSaved = false
}: ScrapingResultProps) {
    const [activeTab, setActiveTab] = useState<'headings' | 'links' | 'issues' | 'screenshot' | 'summary'>('headings');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
    const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Count issues by type
    const issuesByType = (result.issues || []).reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Count broken links
    const brokenLinksCount = (result.links || []).filter(link => link.isBroken).length;

    // Format the scraped date
    const scrapedDate = result.createdAt ? formatDate(new Date(result.createdAt)) : formatDate(new Date());

    // Handle fullscreen toggle for screenshot
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleSaveResult = async () => {
        // If onSave prop is provided, use it
        if (onSave) {
            onSave();
            return;
        }

        // Otherwise, handle saving internally
        try {
            setSaveStatus("saving");
            const response = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result),
            });

            if (!response.ok) {
                throw new Error("Failed to save result");
            }

            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (error) {
            console.error("Error saving result:", error);
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    const handleAnalyzeContent = async () => {
        setIsAnalyzing(true);
        setAnalysisError(null);

        try {
            const scrapedData = {
                url: result.url,
                title: result.title,
                headings: result.headings || [],
                links: result.links || [],
                screenshot: result.screenshot || null,
            };

            const analysisResult = await analyzeContent(scrapedData);
            setAnalysis(analysisResult);
        } catch (error: any) {
            console.error("Error analyzing content:", error);
            setAnalysisError(error.message || "Failed to analyze content");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
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
        <div className="space-y-6">
            {/* Full-screen screenshot modal */}
            {isFullscreen && result.screenshot && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={toggleFullscreen}>
                    <div className="relative max-w-6xl w-full max-h-[90vh] overflow-auto">
                        <button
                            className="fixed top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFullscreen();
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={result.screenshot}
                            alt={`Screenshot of ${result.url}`}
                            className="w-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden card-hover-effect">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h2 className="text-xl font-semibold text-white truncate">{result.title || "Untitled Page"}</h2>
                        <span className="text-sm text-blue-100">Scraped {scrapedDate}</span>
                    </div>
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-100 hover:text-white truncate block mt-1">
                        {result.url}
                    </a>
                </div>

                <div className="p-4 border-b dark:border-gray-700 overflow-x-auto">
                    <div className="flex space-x-2 min-w-max">
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "headings"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                            onClick={() => setActiveTab("headings")}
                        >
                            Headings
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "links"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                            onClick={() => setActiveTab("links")}
                        >
                            Links {brokenLinksCount > 0 && <span className="ml-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 px-1.5 py-0.5 rounded-full text-xs">{brokenLinksCount}</span>}
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "issues"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                            onClick={() => setActiveTab("issues")}
                        >
                            Issues {result.issues?.length > 0 && <span className="ml-1 bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300 px-1.5 py-0.5 rounded-full text-xs">{result.issues.length}</span>}
                        </button>
                        {result.screenshot && (
                            <button
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "screenshot"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                onClick={() => setActiveTab("screenshot")}
                            >
                                Screenshot
                            </button>
                        )}
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "summary"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                            onClick={() => setActiveTab("summary")}
                        >
                            Content Summary
                        </button>

                    </div>
                </div>

                <div className="p-6">
                    {/* Headings Tab */}
                    {activeTab === "headings" && (
                        <div className="space-y-4">
                            {result.headings && result.headings.length > 0 ? (
                                <div className="space-y-3">
                                    {result.headings.map((heading: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`pl-${heading.level * 2} border-l-2 border-blue-200 dark:border-blue-800 p-2 rounded-r-md ${heading.level === 1 ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 w-8">H{heading.level}</span>
                                                <span className={`${heading.level === 1 ? "font-bold text-lg" : heading.level === 2 ? "font-semibold text-md" : ""} text-gray-800 dark:text-gray-200`}>
                                                    {heading.text}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>No headings found on this page</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Links Tab */}
                    {activeTab === "links" && (
                        <div className="space-y-4">
                            {result.links && result.links.length > 0 ? (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {result.links.length} links found ({brokenLinksCount} broken)
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(result.links.map((link: any) => link.href).join('\n'))}>
                                                Copy All
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                        {result.links.map((link: any, index: number) => (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-md flex items-start justify-between group ${link.isBroken
                                                    ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                                    : "bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center">
                                                        {link.isBroken ? (
                                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-2">
                                                                <svg className="w-3 h-3 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        ) : (
                                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-2">
                                                                <svg className="w-3 h-3 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                        <a
                                                            href={link.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`text-sm truncate hover:underline ${link.isBroken ? "text-red-700 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                                                                }`}
                                                        >
                                                            {link.text || link.href}
                                                        </a>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{link.href}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopyLink(link.href)}
                                                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>No links found on this page</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Issues Tab */}
                    {activeTab === "issues" && (
                        <div className="space-y-4">
                            {result.issues && result.issues.length > 0 ? (
                                <div className="space-y-3">
                                    {result.issues.map((issue: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-md ${issue.severity === "high"
                                                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                                : issue.severity === "medium"
                                                    ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                                                    : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                                }`}
                                        >
                                            <div className="flex items-start">
                                                {issue.severity === "high" ? (
                                                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                ) : issue.severity === "medium" ? (
                                                    <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                <div>
                                                    <h4 className={`font-medium ${issue.severity === "high"
                                                        ? "text-red-700 dark:text-red-400"
                                                        : issue.severity === "medium"
                                                            ? "text-yellow-700 dark:text-yellow-400"
                                                            : "text-blue-700 dark:text-blue-400"
                                                        }`}>
                                                        {issue.type}
                                                    </h4>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{issue.description}</p>
                                                    {issue.element && (
                                                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto">
                                                            {issue.element}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <p>No issues detected on this page</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Screenshot Tab */}
                    {activeTab === "screenshot" && result.screenshot && (
                        <div className="space-y-4">
                            <div className="flex justify-end mb-2">
                                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                                    View Full Screen
                                </Button>
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                                <div className="max-h-[600px] overflow-y-auto">
                                    <img
                                        src={result.screenshot}
                                        alt={`Screenshot of ${result.url}`}
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Summary Tab */}
                    {activeTab === "summary" && (
                        <div className="space-y-6">
                            {/* AI-Generated Content Summary */}
                            {analysis?.contentSummary && (
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                                        <BookOpen className="h-5 w-5 mr-2" />
                                        AI Content Summary
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {analysis.contentSummary}
                                    </p>
                                </div>
                            )}

                            {/* Generate Summary Button */}
                            {!analysis?.contentSummary && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">AI Content Summary</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Generate an AI-powered summary of this page's content</p>
                                        </div>
                                        <Button
                                            onClick={handleAnalyzeContent}
                                            disabled={isAnalyzing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <BarChart2 className="h-4 w-4 mr-2" />
                                                    Generate Summary
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Page Title</h4>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate" title={result.title}>
                                        {result.title || "No title"}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                                    <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Headings</h4>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {result.headings?.length || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                                    <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Links</h4>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {result.links?.length || 0}
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                                    <h4 className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">Issues</h4>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {result.issues?.length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Visual Content Analysis */}
                            {analysis?.visualContent && (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                                    <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                                        <MessageSquare className="h-5 w-5 mr-2" />
                                        Visual Content Analysis
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                                {analysis.visualContent.imageCount}
                                            </div>
                                            <div className="text-sm text-purple-600 dark:text-purple-400">Image References</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                                {analysis.visualContent.videoCount}
                                            </div>
                                            <div className="text-sm text-purple-600 dark:text-purple-400">Video References</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${analysis.visualContent.hasScreenshot ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {analysis.visualContent.hasScreenshot ? '✓' : '✗'}
                                            </div>
                                            <div className="text-sm text-purple-600 dark:text-purple-400">Screenshot Available</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                        {analysis.visualContent.visualSummary}
                                    </p>
                                </div>
                            )}

                            {/* Content Structure Overview */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Content Structure</h3>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Heading Structure</h4>
                                        {result.headings && result.headings.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {[1, 2, 3, 4, 5, 6].map(level => {
                                                    const count = result.headings.filter((h: any) => h.level === level).length;
                                                    return count > 0 ? (
                                                        <span key={level} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                                                            H{level}: {count}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">No headings found</p>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Link Status</h4>
                                        <div className="flex space-x-4">
                                            <span className="text-sm text-green-600 dark:text-green-400">
                                                ✓ Total Links: {result.links?.length || 0}
                                            </span>
                                            {brokenLinksCount > 0 && (
                                                <span className="text-sm text-red-600 dark:text-red-400">
                                                    ✗ Broken: {brokenLinksCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {result.issues && result.issues.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Breakdown</h4>
                                            <div className="flex space-x-4">
                                                {['high', 'medium', 'low'].map(severity => {
                                                    const count = result.issues.filter((issue: any) => issue.severity === severity).length;
                                                    return count > 0 ? (
                                                        <span key={severity} className={`text-sm ${severity === 'high' ? 'text-red-600 dark:text-red-400' :
                                                            severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                                                'text-blue-600 dark:text-blue-400'
                                                            }`}>
                                                            {severity.charAt(0).toUpperCase() + severity.slice(1)}: {count}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSaveResult}
                    disabled={isSaving || isSaved || saveStatus === "saving" || saveStatus === "success"}
                    className="relative"
                >
                    {isSaving || saveStatus === "saving" ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : isSaved || saveStatus === "success" ? (
                        <>
                            <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Saved
                        </>
                    ) : saveStatus === "error" ? (
                        <>
                            <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Try Again
                        </>
                    ) : (
                        "Save Result"
                    )}
                </Button>
            </div>
        </div>
    );
}

// Also export as ScrapingResult for backward compatibility
export const ScrapingResult = ScrapingResultDisplay; 