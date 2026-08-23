// Navigate to the Y Combinator companies directory
navigate(input.url, {wait_until: 'navigate'});

// Wait for the page to load and company links to appear
wait("a[href^='/companies/']");

// Scroll down to trigger lazy loading
for (let i = 0; i < 5; i++) {
    scroll_to('bottom');
    wait_timeout(1000);
}

// Parse all company URLs from the page
const {company_urls} = parse();

// Limit to maximum 50 companies
const limited_urls = company_urls.slice(0, 50);

console.log(`Collected ${limited_urls.length} company URLs (limited to 50)`);

// Collect each company URL using next_stage
for (let url of limited_urls) {
    next_stage({url});
}
