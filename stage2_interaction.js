// Helper function to extract company name from URL as fallback
function extractCompanyNameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'companies') {
      return pathParts[1].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  return null;
}

// Helper function to create fallback result with all 14 keys
function createFallbackResult(url) {
  return {
    company_name: extractCompanyNameFromUrl(url),
    batch: null,
    status: null,
    one_liner: null,
    company_description: null,
    location: null,
    website: null,
    product_page_url: null,
    ceo_name: null,
    founders: [],
    team_size: null,
    categories: [],
    funding_raised: null,
    year_founded: null
  };
}

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000;

let attempt = 0;
let success = false;
let result = null;

while (attempt <= MAX_RETRIES && !success) {
  try {
    if (attempt > 0) {
      console.log(`Retry attempt ${attempt} after ${RETRY_DELAY}ms delay`);
      wait_timeout(RETRY_DELAY);
    }
    
    navigate(input.url, {allow_status: [502, 503]});
    
    const current_status = status_code();
    console.log(`Navigation status code: ${current_status}`);
    
    if (current_status === 502 || current_status === 503) {
      console.log(`Server error ${current_status} detected`);
      attempt++;
      continue;
    }
    
    if (el_exists('#verification-code')) {
      console.log('Captcha detected');
      attempt++;
      continue;
    }
    
    
    if (el_exists('.home-wrapper') || el_exists('[class*="not-found"]')) {
      console.log('Page not found or redirected to home');
      result = createFallbackResult(input.url);
      success = true;
      break;
    }
    
    result = parse();
    success = true;
    
  } catch (e) {
    console.log(`Attempt ${attempt + 1} failed: ${e.message}`);
    attempt++;
    
    if (attempt > MAX_RETRIES) {
      console.log('Max retries reached, returning fallback result');
      result = createFallbackResult(input.url);
      success = true;
    }
  }
}

collect(result);
