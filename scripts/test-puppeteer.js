const puppeteer = require('puppeteer');

async function testPuppeteer() {
    console.log('Testing Puppeteer configuration...');

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        console.log('✅ Browser launched successfully');

        const page = await browser.newPage();
        console.log('✅ Page created successfully');

        await page.goto('https://example.com');
        console.log('✅ Navigation successful');

        const title = await page.title();
        console.log(`✅ Page title: ${title}`);

        await browser.close();
        console.log('✅ Browser closed successfully');

        console.log('\n🎉 All tests passed! Puppeteer is working correctly.');
    } catch (error) {
        console.error('❌ Error testing Puppeteer:', error.message);
        process.exit(1);
    }
}

testPuppeteer();
