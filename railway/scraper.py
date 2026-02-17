#!/usr/bin/env python3
"""
Scorecard scraper using Playwright to handle JavaScript-rendered pages.
Usage: python scrape_scorecard.py <url>
"""

import sys
import json
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

def scrape(url):
    """
    Scrape scorecard data from a URL using Playwright.
    Returns JSON with batting and bowling data.
    """
    try:
        with sync_playwright() as p:
            # Launch browser in headless mode
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Navigate to URL
            print(f"🔍 Loading URL: {url}", file=sys.stderr)
            page.goto(url, wait_until="networkidle", timeout=30000)
            
            # Wait for content to load (adjust selector based on actual site)
            # This is a generic wait - we'll need to customize based on the actual scorecard site
            page.wait_for_timeout(3000)  # Wait 3 seconds for JS to execute
            
            # Get the full HTML after JavaScript execution
            html_content = page.content()
            
            print(f"✅ Page loaded, HTML length: {len(html_content)}", file=sys.stderr)
            
            # Try to find tables
            tables = page.locator("table").all()
            print(f"📋 Found {len(tables)} tables", file=sys.stderr)
            
            # Parse scorecard data
            batting_data = []
            bowling_data = []
            
            # Find batting tables (class="inningsBatting")
            batting_tables = page.locator("table.inningsBatting").all()
            print(f"📊 Found {len(batting_tables)} batting tables", file=sys.stderr)
            
            for table_idx, table in enumerate(batting_tables):
                print(f"📊 Processing batting table {table_idx + 1}", file=sys.stderr)
                rows = table.locator("tbody tr").all()
                print(f"   Found {len(rows)} rows in table", file=sys.stderr)
                current_batsman = None
                
                for row_idx, row in enumerate(rows):
                    cells = row.locator("td").all()
                    cell_count = len(cells)
                    
                    if cell_count >= 6:  # Batting row
                        try:
                            # Try to get player name from link
                            name_elem = row.locator("td a").first
                            if name_elem:
                                name = name_elem.inner_text().strip()
                            else:
                                name = cells[0].inner_text().strip()
                            
                            runs = cells[1].inner_text().strip()
                            balls = cells[2].inner_text().strip()
                            fours = cells[3].inner_text().strip()
                            sixes = cells[4].inner_text().strip()
                            sr = cells[5].inner_text().strip()
                            
                            print(f"   Row {row_idx}: {name} - {runs}({balls})", file=sys.stderr)
                            
                            current_batsman = {
                                "name": name,
                                "runs": int(runs) if runs.isdigit() else 0,
                                "balls": int(balls) if balls.isdigit() else 0,
                                "fours": int(fours) if fours.isdigit() else 0,
                                "sixes": int(sixes) if sixes.isdigit() else 0,
                                "strike_rate": float(sr) if sr.replace('.', '').replace('-', '').isdigit() else 0,
                                "dismissal": ""
                            }
                        except Exception as e:
                            print(f"⚠️  Error parsing batting row {row_idx}: {e}", file=sys.stderr)
                    elif cell_count == 1 and current_batsman:  # Dismissal row
                        try:
                            dismissal = cells[0].inner_text().strip()
                            current_batsman["dismissal"] = dismissal
                            batting_data.append(current_batsman)
                            print(f"   Added batsman: {current_batsman['name']}", file=sys.stderr)
                            current_batsman = None
                        except Exception as e:
                            print(f"⚠️  Error parsing dismissal: {e}", file=sys.stderr)
                    else:
                        print(f"   Row {row_idx}: {cell_count} cells (skipped)", file=sys.stderr)
            
            # Find bowling tables (class="inningsBowling")
            bowling_tables = page.locator("table.inningsBowling").all()
            print(f"🎳 Found {len(bowling_tables)} bowling tables", file=sys.stderr)
            
            for table_idx, table in enumerate(bowling_tables):
                print(f"🎳 Processing bowling table {table_idx + 1}", file=sys.stderr)
                rows = table.locator("tbody tr").all()
                print(f"   Found {len(rows)} rows in table", file=sys.stderr)
                
                for row_idx, row in enumerate(rows):
                    cells = row.locator("td").all()
                    cell_count = len(cells)
                    
                    if cell_count >= 6:  # Bowling row
                        try:
                            # Try to get bowler name from link
                            name_elem = row.locator("td a").first
                            if name_elem:
                                name = name_elem.inner_text().strip()
                            else:
                                name = cells[0].inner_text().strip()
                            
                            overs = cells[1].inner_text().strip()
                            runs = cells[2].inner_text().strip()
                            wickets = cells[3].inner_text().strip()
                            extras = cells[4].inner_text().strip()
                            economy = cells[5].inner_text().strip()
                            
                            print(f"   Row {row_idx}: {name} - {overs} overs, {runs}/{wickets}", file=sys.stderr)
                            
                            bowling_data.append({
                                "name": name,
                                "overs": float(overs) if overs.replace('.', '').isdigit() else 0,
                                "runs": int(runs) if runs.isdigit() else 0,
                                "wickets": int(wickets) if wickets.isdigit() else 0,
                                "extras": int(extras) if extras.isdigit() else 0,
                                "economy": float(economy) if economy.replace('.', '').isdigit() else 0
                            })
                            print(f"   Added bowler: {name}", file=sys.stderr)
                        except Exception as e:
                            print(f"⚠️  Error parsing bowling row {row_idx}: {e}", file=sys.stderr)
                    else:
                        print(f"   Row {row_idx}: {cell_count} cells (skipped)", file=sys.stderr)
            
            print(f"✅ Parsed {len(batting_data)} batting entries", file=sys.stderr)
            print(f"✅ Parsed {len(bowling_data)} bowling entries", file=sys.stderr)
            
            # Extract match scores and result
            match_info = {}
            try:
                # Look for innings headers with scores (e.g., "Cary Avengers 126 / 6")
                innings_headers = page.locator(".panel-heading.elegant-color .panel-title.inningsName").all()
                print(f"📊 Found {len(innings_headers)} innings headers", file=sys.stderr)
                
                for idx, header in enumerate(innings_headers):
                    text = header.inner_text().strip()
                    print(f"   Innings {idx + 1}: {text}", file=sys.stderr)
                    
                    # Parse score like "126 / 6" from the header
                    if "/" in text:
                        parts = text.split()
                        score_part = parts[-1]  # Last part should be "6"
                        runs_part = parts[-3]   # Third from last should be "126"
                        
                        if idx == 0:  # First innings
                            match_info["first_innings_runs"] = int(runs_part) if runs_part.isdigit() else 0
                            match_info["first_innings_wickets"] = int(score_part) if score_part.isdigit() else 0
                        elif idx == 1:  # Second innings
                            match_info["second_innings_runs"] = int(runs_part) if runs_part.isdigit() else 0
                            match_info["second_innings_wickets"] = int(score_part) if score_part.isdigit() else 0
                
                # Look for result text
                result_elem = page.locator("#result").first
                if result_elem:
                    result_text = result_elem.inner_text().strip()
                    print(f"🏆 Result: {result_text}", file=sys.stderr)
                    match_info["result"] = result_text
                
                # Extract match details from panel body
                panel_body = page.locator(".panel-body").first
                if panel_body:
                    body_text = panel_body.inner_text()
                    lines = body_text.split('\n')
                    
                    for line in lines:
                        line = line.strip()
                        if line.startswith("Date:"):
                            match_info["date"] = line.replace("Date:", "").strip()
                            print(f"📅 Date: {match_info['date']}", file=sys.stderr)
                        elif line.startswith("Ground:"):
                            match_info["location"] = line.replace("Ground:", "").strip()
                            print(f"📍 Location: {match_info['location']}", file=sys.stderr)
                        elif line.startswith("Result:"):
                            result_detail = line.replace("Result:", "").strip()
                            match_info["result_detail"] = result_detail
                            print(f"🏆 Result Detail: {result_detail}", file=sys.stderr)
                
                # Extract opponent from result text (e.g., "The Naughtys vs. Cary Avengers")
                if "result" in match_info and " vs. " in match_info["result"]:
                    teams = match_info["result"].split(" vs. ")
                    if len(teams) == 2:
                        match_info["team1"] = teams[0].strip()
                        match_info["team2"] = teams[1].strip()
                        print(f"⚔️  Teams: {match_info['team1']} vs {match_info['team2']}", file=sys.stderr)
                
                # Extract Man of the Match
                mom_elem = page.locator("text=/MoM:/i").first
                if mom_elem:
                    try:
                        # Get the parent element and extract MoM name
                        parent = mom_elem.locator("xpath=..").first
                        mom_text = parent.inner_text()
                        # Extract name after "MoM:" or "Mom:"
                        if "MoM:" in mom_text:
                            mom_name = mom_text.split("MoM:")[1].strip()
                        elif "Mom:" in mom_text:
                            mom_name = mom_text.split("Mom:")[1].strip()
                        else:
                            mom_name = mom_text.replace("MoM", "").replace("Mom", "").strip()
                        
                        match_info["man_of_match"] = mom_name
                        print(f"🏆 Man of the Match: {mom_name}", file=sys.stderr)
                    except Exception as e:
                        print(f"⚠️  Error extracting MoM: {e}", file=sys.stderr)
                
                # Validate that "Cary Avengers" is in the scorecard
                page_text = html_content.lower()
                if "cary avengers" not in page_text:
                    print(f"❌ Validation failed: 'Cary Avengers' not found in scorecard", file=sys.stderr)
                    return {
                        "success": False,
                        "error": "This scorecard does not appear to be for Cary Avengers. Please verify the URL."
                    }
                
                print(f"✅ Validation passed: Cary Avengers found in scorecard", file=sys.stderr)
                    
            except Exception as e:
                print(f"⚠️  Error parsing match info: {e}", file=sys.stderr)
            
            browser.close()
            
            # Return structured data
            result = {
                "success": True,
                "url": url,
                "html_length": len(html_content),
                "full_html": html_content,
                "table_count": len(tables),
                "batting_data": batting_data,
                "bowling_data": bowling_data,
                "match_info": match_info,
                "message": f"Successfully parsed {len(batting_data)} batting entries and {len(bowling_data)} bowling entries"
            }
            
            print(f"🔄 Returning result with {len(batting_data)} batting and {len(bowling_data)} bowling entries", file=sys.stderr)
            return result
            
    except PlaywrightTimeout:
        return {
            "success": False,
            "error": "Timeout: Page took too long to load"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error: {str(e)}"
        }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "URL argument required"}))
        sys.exit(1)
    
    url = sys.argv[1]
    result = scrape(url)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
