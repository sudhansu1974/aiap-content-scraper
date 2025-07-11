# Content Scraper

A modern web application for extracting and analyzing content from any website. Built with Next.js 14+, Supabase, Shadcn UI, TailwindCSS, TypeScript, and Firecrawl API.

## Features

- **Easy URL Input & Validation**: User-friendly input field for website URLs with validation and clipboard support
- **Content Extraction**: Scrape and display page titles, headings (H1-H6), and hyperlinks
- **Screenshot Capture**: Generate and display screenshots of scraped pages
- **Save & Retrieve Results**: Store all scraped data and screenshots in Supabase
- **Basic Issue Detection**: Highlight broken links and flag missing titles or headings
- **AI Content Analysis**: Get AI-powered content summaries, readability scores, sentiment analysis, and improvement suggestions using OpenAI
- **Visual Content Analysis**: Analyze images, videos, and visual elements on scraped pages

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React Server Components, TypeScript
- **UI**: Shadcn UI, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Web Scraping**: Firecrawl.dev API
- **AI Analysis**: OpenAI GPT-3.5-turbo for content analysis
- **Form Validation**: Zod, React Hook Form
- **Database & Storage**: Supabase

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- Supabase account
- Firecrawl API key (for web scraping)
- OpenAI API key (for AI content analysis)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/content-scraper.git
   cd content-scraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Firecrawl API credentials (for web scraping)
   FIRECRAWL_API_KEY=your-firecrawl-api-key
   FIRECRAWL_API_URL=https://api.firecrawl.dev

   # OpenAI API credentials (for AI content analysis)
   OPENAI_API_KEY=your-openai-api-key
   
   # GitHub Repository URL (for footer links)
   GITHUB_REPO_URL=https://github.com/sudhansu1974/aiap-content-scraper
   ```

   **Getting Firecrawl API Key:**
   1. Go to [Firecrawl](https://firecrawl.dev)
   2. Sign up for an account
   3. Navigate to your dashboard
   4. Copy your API key and add it to your `.env.local` file

   **Getting OpenAI API Key:**
   1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   2. Sign up or log in to your account
   3. Create a new API key
   4. Copy the key and add it to your `.env.local` file

4. Set up your Supabase database with the following table:
   ```sql
   CREATE TABLE scraped_data (
     id UUID PRIMARY KEY,
     url TEXT NOT NULL,
     title TEXT,
     headings JSONB,
     links JSONB,
     screenshot TEXT,
     issues JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. Test your Firecrawl integration (optional):
```bash
npm run test:firecrawl
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
content-scraper/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   └── scrape/         # Scraping API endpoint
│   │   ├── history/            # Scraping history page
│   │   ├── results/[id]/       # Individual result page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── url-form.tsx        # URL input form
│   │   ├── scraping-result.tsx # Results display
│   │   └── history-list.tsx    # History list
│   ├── lib/                    # Utility libraries
│   │   ├── firecrawl/          # Firecrawl web scraping client
│   │   ├── ai/                 # OpenAI content analysis
│   │   ├── supabase/           # Supabase client
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
└── public/                     # Static assets
```

## Usage

1. Enter a URL in the input field on the home page
2. Click "Scrape Content" to extract data from the website
3. View the extracted content in organized tabs:
   - **Headings**: Page structure and hierarchy
   - **Links**: All hyperlinks with broken link detection
   - **Issues**: Detected problems and improvement suggestions
   - **Screenshot**: Full-page screenshot of the website
   - **Content Summary**: AI-powered content analysis and visual content metrics
   - **AI Content Analysis**: Detailed readability, sentiment, keywords, and suggestions
4. Generate AI-powered content summaries and analysis using OpenAI
5. Save the results to your Supabase database
6. Access your scraping history on the History page

## Deployment on Vercel

This application is optimized for deployment on Vercel using the Firecrawl API for web scraping.

### Environment Variables for Vercel

Set the following environment variables in your Vercel dashboard:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Firecrawl API credentials (for web scraping)
FIRECRAWL_API_KEY=your-firecrawl-api-key
FIRECRAWL_API_URL=https://api.firecrawl.dev

# OpenAI API credentials (for AI content analysis)
OPENAI_API_KEY=your-openai-api-key
```

### Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy!

The application uses Firecrawl's API for web scraping, which eliminates the need for browser dependencies in serverless environments.

### Troubleshooting Vercel Deployment

#### Common Error: "Unexpected token 'A', 'An error o'... is not valid JSON"

This error typically occurs when Firecrawl returns an HTML error page instead of JSON. **Solutions:**

1. **Check API Key**: Verify `FIRECRAWL_API_KEY` is correctly set in Vercel environment variables
2. **API Credits**: Ensure your Firecrawl account has sufficient credits
3. **Rate Limiting**: You may be hitting Firecrawl's rate limits - wait and try again
4. **Network Issues**: Temporary connectivity issues between Vercel and Firecrawl

#### Other Common Issues:

1. **Environment Variables**: Ensure all required environment variables are set in Vercel dashboard (not just `.env.local`)
2. **API Keys**: Verify your Firecrawl and OpenAI API keys are valid and active
3. **Function Timeout**: Monitor function timeout limits (current limit: 28 seconds with built-in timeout handling)
4. **Rate Limits**: Check if you're hitting API rate limits on Firecrawl or OpenAI
5. **Redeploy**: After adding environment variables, trigger a new deployment

For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
