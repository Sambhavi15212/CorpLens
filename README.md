# CorpLens
# Y Combinator Startup Intelligence Extractor (2-Stage Pipeline)

An automated web crawler built for the **Scrape-Verse Hackathon** using **Bright Data Scraper Studio**. It uses a multi-stage architecture to discover Y Combinator company profiles, handle dynamic JavaScript rendering, and extract structured datasets.

## Architecture & Code Structure

- **`stage1_interaction.js`**: Navigates `ycombinator.com/companies`, triggers lazy-loading via dynamic scrolling, throttles execution to 50 items, and passes target endpoints to `next_stage()`.
- **`stage1_parser.js`**: Parses listing pages with `Cheerio`, extracts unique profile URLs matching `a[href^='/companies/']`, and deduplicates links.
- **`stage2_interaction.js`**: Manages subpage execution with retry handling (up to 2 retries) for HTTP `502`/`503` errors and CAPTCHA detection. Features URL slug-based fallback generation (`extractCompanyNameFromUrl`) if page redirects occur.
- **`stage2_parser.js`**: Extracts company metadata using a **hybrid JSON + DOM parsing approach**:
  1. Primary extraction reads embedded Next.js state data (`div[data-page]`).
  2. Fallback extraction uses Cheerio selectors for raw HTML parsing.
  3. Description sanitizer strips recruitment copy, promotional URLs, CTAs, and founder bio paragraphs.

## Target Output Schema

Every object output by Stage 2 contains:
`company_name`, `batch`, `status`, `one_liner`, `company_description`, `location`, `website`, `product_page_url`, `ceo_name`, `founders`, `team_size`, `categories`, `input`, `year_founded`.

## AI Assistant Disclosure (Rule 11)
This project utilized an AI coding assistant (Gemini / VS Code) to design custom regex patterns for description cleaning, optimize multi-stage error retry loops, and generate project documentation. All code was manually integrated and validated inside Bright Data Scraper Studio.
