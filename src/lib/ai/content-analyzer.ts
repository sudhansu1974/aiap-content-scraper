/**
 * Content analyzer module for AI-powered content analysis using OpenAI
 */

import { ScrapedData } from '@/lib/puppeteer/client';
import OpenAI from 'openai';

export interface ContentAnalysis {
    summary: string;
    readabilityScore: number;
    readabilityLevel: 'Easy' | 'Medium' | 'Hard';
    keywordDensity: Record<string, number>;
    topKeywords: string[];
    sentimentScore: number;
    sentimentAnalysis: string;
    suggestions: string[];
    visualContent?: {
        imageCount: number;
        videoCount: number;
        hasScreenshot: boolean;
        visualSummary: string;
    };
    contentSummary: string;
}

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
      })
    : null;

/**
 * Analyzes the content of a scraped website using OpenAI
 * @param data The scraped website data
 * @returns Content analysis results
 */
export async function analyzeContent(
    data: ScrapedData
): Promise<ContentAnalysis> {
    // Extract all text content
    const title = data.title || '';
    const headingTexts = data.headings.map((h) => h.text).join(' ');
    const linkTexts = data.links.map((l) => l.text).join(' ');
    const allText = `${title} ${headingTexts} ${linkTexts}`;

    try {
        // Use OpenAI if available, otherwise fallback to heuristic analysis
        if (openai && process.env.OPENAI_API_KEY) {
            return await analyzeWithOpenAI(data, allText);
        } else {
            console.warn('OpenAI API key not found, using fallback analysis');
            return await analyzeWithHeuristics(data, allText);
        }
    } catch (error) {
        console.error('Error in content analysis:', error);
        // Fallback to heuristic analysis if OpenAI fails
        return await analyzeWithHeuristics(data, allText);
    }
}

/**
 * Analyzes content using OpenAI API
 */
async function analyzeWithOpenAI(
    data: ScrapedData,
    allText: string
): Promise<ContentAnalysis> {
    if (!openai) {
        throw new Error('OpenAI client not initialized');
    }

    // Prepare content for analysis
    const contentForAnalysis = {
        title: data.title,
        headings: data.headings.map((h) => `H${h.level}: ${h.text}`).join('\n'),
        links: data.links
            .slice(0, 20)
            .map((l) => l.text || l.href)
            .join('\n'), // Limit links to avoid token limits
        hasScreenshot: !!data.screenshot,
        url: data.url,
    };

    // Create comprehensive analysis prompt
    const analysisPrompt = `
Analyze the following website content and provide a comprehensive analysis:

URL: ${contentForAnalysis.url}
Title: ${contentForAnalysis.title}

Headings:
${contentForAnalysis.headings}

Links (sample):
${contentForAnalysis.links}

Has Screenshot: ${contentForAnalysis.hasScreenshot ? 'Yes' : 'No'}

Please provide:
1. A detailed content summary (2-3 sentences)
2. Readability assessment (score 0-100, where 0 is very easy, 100 is very difficult)
3. Top 5 keywords from the content
4. Sentiment analysis (score -1 to 1, where -1 is very negative, 1 is very positive)
5. 3-5 content improvement suggestions
6. Visual content analysis if screenshot is available

Format your response as JSON with the following structure:
{
  "contentSummary": "string",
  "readabilityScore": number,
  "readabilityLevel": "Easy|Medium|Hard",
  "topKeywords": ["string"],
  "sentimentScore": number,
  "sentimentAnalysis": "string",
  "suggestions": ["string"],
  "visualSummary": "string"
}
`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a content analysis expert. Analyze web content and provide detailed insights in JSON format. Be precise and helpful.',
                },
                {
                    role: 'user',
                    content: analysisPrompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 1000,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from OpenAI');
        }

        // Parse the JSON response
        const aiAnalysis = JSON.parse(response);

        // Calculate keyword density from the extracted keywords
        const { keywordDensity } = calculateKeywordDensity(allText);

        // Analyze visual content
        const visualContent = analyzeVisualContent(
            data,
            aiAnalysis.visualSummary
        );

        return {
            summary: aiAnalysis.contentSummary,
            contentSummary: aiAnalysis.contentSummary,
            readabilityScore: aiAnalysis.readabilityScore,
            readabilityLevel: aiAnalysis.readabilityLevel,
            keywordDensity,
            topKeywords: aiAnalysis.topKeywords,
            sentimentScore: aiAnalysis.sentimentScore,
            sentimentAnalysis: aiAnalysis.sentimentAnalysis,
            suggestions: aiAnalysis.suggestions,
            visualContent,
        };
    } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        throw error;
    }
}

/**
 * Analyzes visual content from the scraped data
 */
function analyzeVisualContent(
    data: ScrapedData,
    visualSummary?: string
): {
    imageCount: number;
    videoCount: number;
    hasScreenshot: boolean;
    visualSummary: string;
} {
    // Count images and videos from links (basic heuristic)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];

    const imageCount = data.links.filter((link) =>
        imageExtensions.some((ext) => link.href.toLowerCase().includes(ext))
    ).length;

    const videoCount = data.links.filter((link) =>
        videoExtensions.some((ext) => link.href.toLowerCase().includes(ext))
    ).length;

    const hasScreenshot = !!data.screenshot;

    const defaultVisualSummary = `This page ${
        hasScreenshot
            ? 'has been captured in a screenshot'
            : 'does not have a screenshot'
    }. ${
        imageCount > 0
            ? `Found ${imageCount} image references.`
            : 'No image references found.'
    } ${
        videoCount > 0
            ? `Found ${videoCount} video references.`
            : 'No video references found.'
    }`;

    return {
        imageCount,
        videoCount,
        hasScreenshot,
        visualSummary: visualSummary || defaultVisualSummary,
    };
}

/**
 * Fallback analysis using heuristics when OpenAI is not available
 */
async function analyzeWithHeuristics(
    data: ScrapedData,
    allText: string
): Promise<ContentAnalysis> {
    // Generate a simple summary
    const summary = generateSummary(data.title || '', data.headings);

    // Calculate readability score (simplified)
    const readabilityScore = calculateReadabilityScore(allText);
    const readabilityLevel = getReadabilityLevel(readabilityScore);

    // Calculate keyword density
    const { keywordDensity, topKeywords } = calculateKeywordDensity(allText);

    // Calculate sentiment (simplified)
    const sentimentScore = calculateSentiment(allText);
    const sentimentAnalysis = getSentimentAnalysis(sentimentScore);

    // Generate suggestions
    const suggestions = generateSuggestions(data);

    // Analyze visual content
    const visualContent = analyzeVisualContent(data);

    return {
        summary,
        contentSummary: summary,
        readabilityScore,
        readabilityLevel,
        keywordDensity,
        topKeywords,
        sentimentScore,
        sentimentAnalysis,
        suggestions,
        visualContent,
    };
}

/**
 * Generates a summary of the content
 */
function generateSummary(
    title: string,
    headings: { level: number; text: string }[]
): string {
    const h1s = headings.filter((h) => h.level === 1).map((h) => h.text);
    const h2s = headings.filter((h) => h.level === 2).map((h) => h.text);

    if (h1s.length > 0) {
        return `This page is about ${title}. The main topics covered are ${h1s.join(
            ', '
        )}${
            h2s.length > 0
                ? ` with subtopics including ${h2s.slice(0, 3).join(', ')}`
                : ''
        }.`;
    }

    return `This page is about ${title}${
        h2s.length > 0
            ? ` and covers topics like ${h2s.slice(0, 3).join(', ')}`
            : ''
    }.`;
}

/**
 * Calculates a simplified readability score
 */
function calculateReadabilityScore(text: string): number {
    // This is a very simplified version of readability calculation
    // Real implementations would use algorithms like Flesch-Kincaid

    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter(Boolean);

    if (sentences.length === 0) return 50;

    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter((word) => word.length > 6).length;
    const longWordPercentage = (longWords / words.length) * 100;

    // Score from 0-100, higher is more complex
    const score = 60 + avgWordsPerSentence * 2 + longWordPercentage / 2;

    // Clamp between 0-100
    return Math.max(0, Math.min(100, score));
}

/**
 * Maps a readability score to a level
 */
function getReadabilityLevel(score: number): 'Easy' | 'Medium' | 'Hard' {
    if (score < 40) return 'Easy';
    if (score < 70) return 'Medium';
    return 'Hard';
}

/**
 * Calculates keyword density from text
 */
function calculateKeywordDensity(text: string): {
    keywordDensity: Record<string, number>;
    topKeywords: string[];
} {
    const stopWords = new Set([
        'a',
        'an',
        'the',
        'and',
        'or',
        'but',
        'is',
        'are',
        'was',
        'were',
        'to',
        'of',
        'in',
        'on',
        'at',
        'by',
        'for',
        'with',
        'about',
        'from',
        'this',
        'that',
        'these',
        'those',
        'it',
        'its',
        'they',
        'them',
        'have',
        'has',
        'had',
        'will',
        'would',
        'could',
        'should',
        'can',
        'may',
        'might',
    ]);

    // Tokenize and clean text
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word));

    // Count occurrences
    const wordCounts: Record<string, number> = {};
    words.forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    // Calculate density
    const totalWords = words.length;
    const keywordDensity: Record<string, number> = {};

    Object.entries(wordCounts).forEach(([word, count]) => {
        keywordDensity[word] = +((count / totalWords) * 100).toFixed(2);
    });

    // Get top keywords
    const topKeywords = Object.entries(keywordDensity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);

    return { keywordDensity, topKeywords };
}

/**
 * Calculates a simplified sentiment score
 */
function calculateSentiment(text: string): number {
    // This is a very simplified sentiment analysis
    // Real implementations would use NLP libraries or AI APIs

    const positiveWords = [
        'good',
        'great',
        'best',
        'excellent',
        'amazing',
        'wonderful',
        'fantastic',
        'love',
        'like',
        'enjoy',
        'happy',
        'pleased',
        'satisfied',
        'perfect',
        'outstanding',
        'brilliant',
        'awesome',
        'incredible',
        'superb',
    ];

    const negativeWords = [
        'bad',
        'terrible',
        'awful',
        'horrible',
        'worst',
        'hate',
        'dislike',
        'angry',
        'frustrated',
        'disappointed',
        'sad',
        'poor',
        'failed',
        'broken',
        'wrong',
        'error',
        'problem',
        'issue',
        'difficult',
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((word) => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 0;

    // Return score between -1 and 1
    return (positiveCount - negativeCount) / totalSentimentWords;
}

/**
 * Maps sentiment score to analysis text
 */
function getSentimentAnalysis(score: number): string {
    if (score > 0.3) return 'Very Positive';
    if (score > 0.1) return 'Positive';
    if (score > -0.1) return 'Neutral';
    if (score > -0.3) return 'Negative';
    return 'Very Negative';
}

/**
 * Generates content improvement suggestions
 */
function generateSuggestions(data: ScrapedData): string[] {
    const suggestions: string[] = [];

    // Check heading structure
    const h1Count = data.headings.filter((h) => h.level === 1).length;
    if (h1Count === 0) {
        suggestions.push(
            'Add an H1 heading to improve SEO and content structure'
        );
    } else if (h1Count > 1) {
        suggestions.push(
            'Consider using only one H1 heading per page for better SEO'
        );
    }

    // Note: Broken link checking would be done separately
    // For now, just suggest general link improvements
    if (data.links.length > 0) {
        suggestions.push(
            'Review all links to ensure they are working properly'
        );
    }

    // Check content length
    const totalTextLength = data.headings.reduce(
        (acc, h) => acc + h.text.length,
        0
    );
    if (totalTextLength < 300) {
        suggestions.push(
            'Consider adding more content to improve SEO and provide better value to users'
        );
    }

    // Check for screenshot
    if (!data.screenshot) {
        suggestions.push(
            'Add visual elements or images to make the content more engaging'
        );
    }

    // Default suggestions if none found
    if (suggestions.length === 0) {
        suggestions.push(
            'Content structure looks good - consider adding more interactive elements'
        );
        suggestions.push('Optimize images for better loading performance');
        suggestions.push('Add internal links to improve navigation');
    }

    return suggestions;
}
