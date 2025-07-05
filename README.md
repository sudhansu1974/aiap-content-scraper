# Content Scraper

A modern web application for extracting and analyzing content from any website. Built with Next.js 14+, Supabase, Shadcn UI, TailwindCSS, TypeScript, and Firecrawl.dev.

## Features

- **Easy URL Input & Validation**: User-friendly input field for website URLs with validation and clipboard support
- **Content Extraction**: Scrape and display page titles, headings (H1-H6), and hyperlinks
- **Screenshot Capture**: Generate and display screenshots of scraped pages
- **Save & Retrieve Results**: Store all scraped data and screenshots in Supabase
- **Basic Issue Detection**: Highlight broken links and flag missing titles or headings
- **LLM Analysis**: Get AI-powered suggestions for UI/UX improvements and accessibility issues

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React Server Components, TypeScript
- **UI**: Shadcn UI, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Web Scraping**: Firecrawl.dev API
- **Form Validation**: Zod, React Hook Form
- **Database & Storage**: Supabase

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- Supabase account
- Firecrawl.dev API key

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

   # Firecrawl API credentials
   FIRECRAWL_API_KEY=your-firecrawl-api-key
   FIRECRAWL_API_URL=https://api.firecrawl.dev
   ```

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
│   │   ├── firecrawl/          # Firecrawl API client
│   │   ├── supabase/           # Supabase client
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
└── public/                     # Static assets
```

## Usage

1. Enter a URL in the input field on the home page
2. Click "Scrape Content" to extract data from the website
3. View the extracted content, including headings, links, and screenshot
4. Save the results to your Supabase database
5. Access your scraping history on the History page

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# aiap-content-scraper
