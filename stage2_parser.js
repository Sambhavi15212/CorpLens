// Extract company name
const company_name = $('.text-2xl.font-medium').first().text_sane();

// Extract batch - looking for the batch pill
const batch = $('a[href*="batch="] .yc-tw-Pill span').text_sane() || 
              $('.yc-tw-Pill:contains("Summer") span, .yc-tw-Pill:contains("Winter") span, .yc-tw-Pill:contains("S1"), .yc-tw-Pill:contains("W1")').first().text_sane();

// Extract status - filter non-link pills for known status values
const statusRaw = $('.yc-tw-Pill:not(a)').filter((i, el) => {
  const text = $(el).text_sane();
  return /\b(Active|Acquired|Public|Inactive)\b/.test(text);
}).first().text_sane();
const statusMatch = statusRaw ? statusRaw.match(/\b(Active|Acquired|Public|Inactive)\b/) : null;
const status = statusMatch ? statusMatch[1] : null;

// Extract one-liner
const one_liner = $('.mb-1\\.5.text-lg').text_sane();

// Extract company description from JSON data
const jsonData = $('div[data-page]').attr('data-page');
let company_description = null;
let foundersArray = [];
let year_founded = null;

if (jsonData) {
  try {
    const pageData = JSON.parse(jsonData);
    const longDescription = pageData?.props?.company?.long_description;
    foundersArray = pageData?.props?.company?.founders || [];
    year_founded = pageData?.props?.company?.year_founded || null;
    
    if (longDescription) {
      const founderNames = foundersArray.map(f => f.full_name).filter(Boolean);
      const paragraphs = longDescription.split(/\r?\n\r?\n/).map(p => p.trim()).filter(Boolean);
      
      // Find first paragraph that contains founder-related content
      let firstFounderParagraphIndex = -1;
      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const startsWithPersonal = /^(I'm|I am|I was|I have|My name|We are|We were|Love startups)/i.test(p);
        const hasFounderName = founderNames.some(name => p.includes(name));
        const hasFounderKeywords = /\b(Before founding|Previously|Prior to|Earlier in|Co-?[Ff]ounder|Founder|graduate of|studied at|I graduated|I studied|I worked at|I joined|I started my career)\b/i.test(p);
        
        if (startsWithPersonal || hasFounderName || hasFounderKeywords) {
          firstFounderParagraphIndex = i;
          break;
        }
      }
      
      // Take only paragraphs before founder content
      if (firstFounderParagraphIndex > 0) {
        company_description = paragraphs.slice(0, firstFounderParagraphIndex).join(' ').trim();
      } else {
        company_description = longDescription.trim();
      }
    }
  } catch (e) {
    // Fallback to HTML parsing if JSON parsing fails
    company_description = $('.prose.max-w-full.whitespace-pre-line').text_sane();
  }
}

// Fallback to HTML if JSON extraction failed
if (!company_description) {
  company_description = $('.prose.max-w-full.whitespace-pre-line').text_sane();
}

// Enhanced cleaning of company description
if (company_description) {
  // Replace \r, \n, \t with spaces
  company_description = company_description.replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\t/g, ' ');
  
  const paragraphs = company_description.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
  const cleanedParagraphs = paragraphs.filter(p => {
    const hasRecruitment = /\b(We'?re hiring|We'?re looking for|Join our team|We are hiring|Apply now|Careers at|Open positions|Now hiring|hiring for|join us|work with us|perks|benefits include)\b/i.test(p);
    const hasPromo = /\b(Check out our special deal|Use code|discount|% off|Sign up now|Try it free|Limited time|Special offer|Get \d+%)\b/i.test(p);
    const hasCTA = /\b(click here|learn more|visit us|contact us|reach out|get in touch|follow us|read more|find us on)\b/i.test(p);
    const hasURL = /https?:\/\/|www\.|[a-z0-9-]+\.(com|org|net|io|co|ai|app|dev|tech|blog|site|info|biz|us|uk|ca|de|fr|jp|cn|in|au|edu|gov|mil)\b/i.test(p);
    const hasHashtag = /#\w+/.test(p);
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(p);
    const hasPhone = /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(p);
    const hasPRList = /\b(featured in|as seen in|press coverage|mentioned in|covered by)\b/i.test(p);
    
    return !hasRecruitment && !hasPromo && !hasCTA && !hasURL && !hasHashtag && !hasEmail && !hasPhone && !hasPRList;
  });
  company_description = cleanedParagraphs.join(' ').trim();
  
  // Final pass: replace any remaining newlines with spaces
  company_description = company_description.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

// Extract location
const location_text = $('a[href*="/companies/location/"] .yc-tw-Pill').text_sane();

// Extract website
const website_text = $('.group.flex.flex-row.items-center a').attr('href');
const website = website_text ? new URL(website_text) : null;

// Extract product page URL and other data from JSON
let product_page_url = null;
let ceo_name = null;
let cto_name = null;
let coo_name = null;
let cfo_name = null;
const founders_data = [];

if (jsonData) {
  try {
    const pageData = JSON.parse(jsonData);
    
    // Get product page URL from JSON
    const ycdc_url = pageData?.props?.company?.ycdc_url;
    if (ycdc_url) {
      product_page_url = new URL(ycdc_url);
    }
    
    // Get founders from JSON
    foundersArray.forEach(founder => {
      const founderObj = {
        full_name: founder.full_name || null,
        title: founder.title || null
      };
      founders_data.push(founderObj);
      
      // Extract executive titles from founders
      if (founder.title) {
        const titleLower = founder.title.toLowerCase();
        if (!ceo_name && (titleLower.includes('ceo') || titleLower.includes('chief executive officer'))) {
          ceo_name = founder.full_name;
        }
        if (!cto_name && titleLower.includes('cto')) {
          cto_name = founder.full_name;
        }
        if (!coo_name && titleLower.includes('coo')) {
          coo_name = founder.full_name;
        }
        if (!cfo_name && titleLower.includes('cfo')) {
          cfo_name = founder.full_name;
        }
      }
    });
    
    // Priority logic for ceo_name if not found yet
    if (!ceo_name && foundersArray.length > 0) {
      // Priority 2: First person with 'Founder' or 'Co-founder' in title
      const founderWithTitle = foundersArray.find(f => {
        const titleLower = (f.title || '').toLowerCase();
        return titleLower.includes('founder') || titleLower.includes('co-founder');
      });
      
      if (founderWithTitle) {
        ceo_name = founderWithTitle.full_name;
      } else {
        // Priority 3: First listed person in founders array
        ceo_name = foundersArray[0].full_name || null;
      }
    }
  } catch (e) {
    // Fallback to HTML parsing if JSON parsing fails
  }
}

// Fallback: parse founders from HTML if JSON parsing didn't work
if (founders_data.length === 0) {
  $('.ycdc-card-new.w-full.space-y-1\\.5').each((i, el) => {
    const full_name = $(el).find('.text-xl.font-bold').text_sane();
    const title = $(el).find('.pt-1.text-\\[15px\\].text-gray-600').text_sane();
    
    if (full_name) {
      founders_data.push({
        full_name: full_name,
        title: title || null
      });
      
      if (title) {
        const titleLower = title.toLowerCase();
        if (!ceo_name && (titleLower.includes('ceo') || titleLower.includes('chief executive officer'))) {
          ceo_name = full_name;
        }
        if (!cto_name && titleLower.includes('cto')) {
          cto_name = full_name;
        }
        if (!coo_name && titleLower.includes('coo')) {
          coo_name = full_name;
        }
        if (!cfo_name && titleLower.includes('cfo')) {
          cfo_name = full_name;
        }
      }
    }
  });
  
  // Priority logic for ceo_name if not found yet (HTML fallback)
  if (!ceo_name && founders_data.length > 0) {
    // Priority 2: First person with 'Founder' or 'Co-founder' in title
    const founderWithTitle = founders_data.find(f => {
      const titleLower = (f.title || '').toLowerCase();
      return titleLower.includes('founder') || titleLower.includes('co-founder');
    });
    
    if (founderWithTitle) {
      ceo_name = founderWithTitle.full_name;
    } else {
      // Priority 3: First listed person in founders array
      ceo_name = founders_data[0].full_name || null;
    }
  }
}

// Extract team size
let team_size = null;
const team_size_text = $('.flex.flex-row.justify-between:has(span:contains("Team Size")) span:last-child').text_sane();
if (team_size_text) {
  team_size = parseInt(team_size_text.replace(/,/g, ''));
}

// Extract categories
const categories = [];
$('a[href*="/companies/industry/"] .yc-tw-Pill').each((i, el) => {
  const category = $(el).text_sane();
  if (category) {
    categories.push(category);
  }
});

return {
  company_name: company_name || null,
  batch: batch || null,
  status: status || null,
  one_liner: one_liner || null,
  company_description: company_description || null,
  location: location_text || null,
  website: website,
  product_page_url: product_page_url,
  ceo_name: ceo_name,
  founders: founders_data.length > 0 ? founders_data : [],
  team_size: team_size,
  categories: categories.length > 0 ? categories : [],
  funding_raised: null,
  year_founded: year_founded
};
