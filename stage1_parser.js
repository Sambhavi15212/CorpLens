// Extract all company profile links from the directory page
const base_url = 'https://www.ycombinator.com';

// Find all company links using the stable href-based selector
const company_links = $("a[href^='/companies/']").toArray().map(el => {
    const href = $(el).attr('href');
    return new URL(href, base_url).href;
});

// Remove duplicates
const unique_urls = [...new Set(company_links)];

console.log(`Found ${unique_urls.length} unique company URLs`);

return {
    company_urls: unique_urls
};
