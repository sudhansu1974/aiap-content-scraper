// Test Firecrawl API directly
const { FirecrawlApp } = require('@mendable/firecrawl-js');

async function testFirecrawl() {
    console.log('Testing Firecrawl integration...');

    // Check if API key is set
    if (!process.env.FIRECRAWL_API_KEY) {
        console.log('⚠️  FIRECRAWL_API_KEY not found in environment variables');
        console.log('Please set your Firecrawl API key in .env.local file');
        return;
    }

    try {
        console.log('🔍 Testing Firecrawl API directly...');

        const app = new FirecrawlApp({
            apiKey: process.env.FIRECRAWL_API_KEY,
            apiUrl:
                process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev',
        });

        const result = await app.scrapeUrl('https://example.com', {
            formats: ['markdown', 'html', 'screenshot@fullPage'],
            includeTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a'],
            onlyMainContent: false,
            waitFor: 3000,
        });

        if (!result.success) {
            console.error('❌ Error:', result.error);
            return;
        }

        console.log('✅ Scraping successful!');
        console.log(`📄 Title: ${result.data.metadata?.title || 'N/A'}`);
        console.log(
            `📝 Markdown length: ${
                result.data.markdown?.length || 0
            } characters`
        );
        console.log(
            `📸 Screenshot: ${
                result.data.screenshot ? 'Available' : 'Not available'
            }`
        );

        if (result.data.screenshot) {
            console.log(`📸 Screenshot URL: ${result.data.screenshot}`);
        }

        console.log('\n🎉 Firecrawl integration test passed!');
    } catch (error) {
        console.error('❌ Error testing Firecrawl:', error.message);

        if (error.message.includes('API key')) {
            console.log(
                '💡 Make sure your Firecrawl API key is valid and has sufficient credits'
            );
        }

        if (error.message.includes('unrecognized_keys')) {
            console.log(
                '💡 This error suggests the API format has changed. The fix should resolve this.'
            );
        }
    }
}

testFirecrawl();
