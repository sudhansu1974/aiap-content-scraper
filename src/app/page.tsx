"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UrlForm } from "@/components/url-form";
import { ScrapingResultDisplay } from "@/components/scraping-result";
import { ContentAnalysisDisplay } from "@/components/content-analysis";
import { Loader2, CheckCircle, AlertCircle, Globe, Zap, Shield, Search, X } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapingResult, setScrapingResult] = useState<any>(null);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const handleScrape = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error scraping website");
      }

      const data = await response.json();
      setScrapingResult(data);
    } catch (err: any) {
      console.error("Error scraping website:", err);
      setError(err.message || "Failed to scrape website");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!scrapingResult) return;

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scrapingResult),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save result");
      }

      alert("Result saved successfully!");
    } catch (err: any) {
      console.error("Error saving result:", err);
      alert(err.message || "Failed to save result");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column - Input and features */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="card-hover-effect">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl">Content Scraper</CardTitle>
              <CardDescription className="text-blue-100">
                Extract valuable insights from any website
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <UrlForm onSubmit={handleScrape} isLoading={isLoading} />

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {isLoading && (
                <div className="mt-4 p-4 flex flex-col items-center justify-center text-center">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                    <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-blue-100 dark:bg-blue-900 -z-10"></div>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Scraping content...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">This may take a few seconds</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>What our scraper can do for you</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Globe className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Extract page title, headings, and links</span>
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Detect broken links and accessibility issues</span>
                </li>
                <li className="flex items-start">
                  <Search className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Capture full-page screenshots</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Provide AI-powered content analysis</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowLearnMore(true)}>
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right column - Results */}
        <div className="w-full md:w-2/3">
          {scrapingResult ? (
            <div className="animate-fade-in space-y-6">
              <ScrapingResultDisplay
                result={scrapingResult}
                onSave={handleSaveResult}
              />
            </div>
          ) : !isLoading && !error ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
                <Search className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No content scraped yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Enter a URL in the form to start scraping website content and analyzing its structure.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* AI Content Analysis Section - Bottom */}
      {scrapingResult && (
        <div className="w-full max-w-6xl mx-auto mt-8">
          <ContentAnalysisDisplay scrapedData={scrapingResult} />
        </div>
      )}

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">About Content Scraper</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowLearnMore(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3>How It Works</h3>
                <p>
                  Content Scraper uses Firecrawl, a powerful web scraping API, to extract content from websites.
                  It navigates to the URL you provide, captures the page's structure, and analyzes its content.
                </p>

                <h3>Features</h3>
                <ul>
                  <li><strong>Content Extraction:</strong> Automatically extracts titles, headings (H1-H6), and all links from the page.</li>
                  <li><strong>Screenshot Capture:</strong> Takes a full-page screenshot to give you a visual representation of the website.</li>
                  <li><strong>Link Analysis:</strong> Checks all links on the page to identify broken ones that need attention.</li>
                  <li><strong>Issue Detection:</strong> Analyzes the page structure to find common issues like missing headings, broken links, and accessibility problems.</li>
                  <li><strong>Data Storage:</strong> Save your scraping results to access them later from the History page.</li>
                  <li><strong>AI Content Analysis:</strong> Provides readability scores, keyword density analysis, sentiment analysis, and content improvement suggestions.</li>
                </ul>

                <h3>Use Cases</h3>
                <ul>
                  <li>SEO analysis and optimization</li>
                  <li>Content auditing</li>
                  <li>Competitive research</li>
                  <li>Link checking and maintenance</li>
                  <li>Website accessibility evaluation</li>
                </ul>

                <h3>Technical Details</h3>
                <p>
                  Built with Next.js, TypeScript, TailwindCSS, and Shadcn UI. Uses Firecrawl for web scraping and Supabase for data storage.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowLearnMore(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
