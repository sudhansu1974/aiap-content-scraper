# Content Scraper

A modern web application for extracting and analyzing content from any website. Built with Next.js 14+, Supabase, Shadcn UI, TailwindCSS, TypeScript, and Firecrawl.dev.

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
- **Web Scraping**: Puppeteer (replaced Firecrawl.dev)
- **AI Analysis**: OpenAI GPT-3.5-turbo for content analysis
- **Form Validation**: Zod, React Hook Form
- **Database & Storage**: Supabase

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- Supabase account
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

   # OpenAI API credentials (for AI content analysis)
   OPENAI_API_KEY=your-openai-api-key
   
   # GitHub Repository URL (for footer links)
   GITHUB_REPO_URL=https://github.com/sudhansu1974/aiap-content-scraper
   ```

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

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
│   │   ├── puppeteer/          # Puppeteer web scraping client
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

This application is optimized for deployment on Vercel with serverless Puppeteer support.

### Environment Variables for Vercel

Set the following environment variables in your Vercel dashboard:

```
# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI API credentials (for AI content analysis)
OPENAI_API_KEY=your-openai-api-key

# Puppeteer configuration for serverless deployment
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy!

The application uses `@sparticuz/chromium` for serverless Puppeteer support, which automatically handles Chrome installation in Vercel's environment.

### Troubleshooting Vercel Deployment

If you encounter Chrome-related errors:

1. Ensure `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` is set
2. Verify the `vercel.json` configuration is present
3. Check that `@sparticuz/chromium` is installed
4. Monitor function timeout limits (current limit: 30 seconds)

For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
