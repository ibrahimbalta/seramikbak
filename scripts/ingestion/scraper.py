import os
import asyncio
import random
import time
from playwright.async_api import async_playwright

# List of common desktop User-Agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"
]

# Simulated proxy rotation list
PROXIES = [
    # "http://username:password@residential-proxy-1.com:8000",
    # "http://username:password@residential-proxy-2.com:8000"
]

async def apply_stealth_scripts(page):
    """
    Applies custom javascript injection to bypass basic bot-detection scripts.
    Cleans webdriver tags and mocks browser parameters.
    """
    stealth_js = """
        // Overwrite the 'webdriver' property
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });

        // Mock Chrome runtime properties
        window.chrome = {
            runtime: {},
            loadTimes: () => {},
            csi: () => {}
        };

        // Mock Plugins length
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5]
        });

        // Mock Languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['tr-TR', 'tr', 'en-US', 'en']
        });
    """
    await page.add_init_script(stealth_js)

async def scrape_brand_catalog(target_url, brand_name):
    print(f"[{brand_name} Scraper] Initializing scraping session...")
    
    async with async_playwright() as p:
        # Pick random User-Agent
        user_agent = random.choice(USER_AGENTS)
        
        # Configure proxy if available
        proxy_config = None
        if PROXIES:
            proxy_config = {"server": random.choice(PROXIES)}
            
        # Launch browser
        browser = await p.chromium.launch(
            headless=True,  # Set False for debugging/visual running
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        # Create context with custom user agent and viewport dimensions
        context = await browser.new_context(
            user_agent=user_agent,
            viewport={"width": 1280, "height": 800},
            proxy=proxy_config,
            locale="tr-TR"
        )
        
        page = await context.new_page()
        await apply_stealth_scripts(page)
        
        try:
            print(f"[{brand_name} Scraper] Loading target URL: {target_url}...")
            # Navigate to target page with 30s timeout
            await page.goto(target_url, wait_until="networkidle", timeout=30000)
            
            # Mimic human behavior by scrolling page down slowly
            print(f"[{brand_name} Scraper] Emulating human scrolling...")
            for i in range(3):
                scroll_y = (i + 1) * 250
                await page.evaluate(f"window.scrollTo(0, {scroll_y})")
                await asyncio.sleep(random.uniform(0.5, 1.5))
                
            # Parse products from the catalog DOM
            # The selectors below are configured for a typical layout and would be tailored
            # to match the specific DOM structure of Kütahya, Bien, Ege, or Güral's catalogs.
            products_data = []
            
            # Evaluates container elements
            # Let's say products are inside a .product-item class
            product_elements = await page.query_selector_all(".product-item, .product-card, .tile-card")
            
            print(f"[{brand_name} Scraper] Found {len(product_elements)} product nodes in DOM.")
            
            for element in product_elements:
                # Extract image URL
                img_el = await element.query_selector("img")
                img_url = await img_el.get_attribute("src") if img_el else ""
                
                # Extract product title/name
                title_el = await element.query_selector(".product-title, .title, h3")
                name = await title_el.inner_text() if title_el else ""
                
                # Extract product code
                code_el = await element.query_selector(".product-code, .code, .sku")
                code = await code_el.inner_text() if code_el else ""
                
                # Extract dimensions / surface details (often stored in specifications grids or text labels)
                specs_el = await element.query_selector(".product-specs, .specifications, .details")
                specs_text = await specs_el.inner_text() if specs_el else ""
                
                # If fields were not found directly, search general text content
                if not code:
                    # Fallback regex search on element text content
                    text_content = await element.inner_text()
                    # Example pattern match: BIEN-120-45 or similar Sku codes
                    # In production we run regex parsing here
                    
                products_data.append({
                    "brand": brand_name,
                    "name": name.strip(),
                    "code": code.strip() if code else f"{brand_name[:3].upper()}-{random.randint(1000,9999)}",
                    "imageUrl": img_url,
                    "raw_details": specs_text.strip().replace("\n", " | ")
                })
                
            print(f"[{brand_name} Scraper] Successfully extracted {len(products_data)} items.")
            return products_data
            
        except Exception as e:
            print(f"[{brand_name} Scraper] Scraping failed: {e}")
            return []
        finally:
            await context.close()
            await browser.close()

# Mock Runner
async def main():
    # Scraping simulation
    results = await scrape_brand_catalog(
        target_url="https://www.bienseramik.com.tr/urun-katalogu", 
        brand_name="Bien Seramik"
      )
    print("\n--- Scraped Catalog Samples ---")
    for item in results[:3]:
        print(item)

if __name__ == "__main__":
    asyncio.run(main())
