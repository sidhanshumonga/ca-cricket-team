# Scorecard Scraper Setup

## Local Development

The scorecard scraping feature uses Python + Playwright to extract match data from scorecard URLs.

### Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r scripts/requirements.txt

# Install Playwright browsers
playwright install chromium
```

### Test

```bash
source venv/bin/activate
python3 scripts/scrape_scorecard.py "https://tclnc.org/matches/scorecard/YOUR_ID"
```

## How It Works

The app automatically uses the local Python script when running `npm run dev`.

No environment variables needed for local development!

## Production Deployment

**Current Recommendation:** Use the scraping feature locally only.

When you need production scraping:
1. Deploy Python scraper to Railway.app (supports Playwright)
2. Add Railway URL to Vercel environment variables
3. App will automatically use Railway in production

## Troubleshooting

**Python not found:**
```bash
which python3
```

**Playwright browser not found:**
```bash
source venv/bin/activate
playwright install chromium
```

**Scraper returns empty data:**
- Verify "Cary Avengers" appears in the scorecard
- Check the scorecard URL is accessible
