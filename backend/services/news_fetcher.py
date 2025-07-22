import time
from datetime import datetime, timedelta
from typing import List, Dict
from urllib.parse import quote_plus

import feedparser
from bs4 import BeautifulSoup
from loguru import logger


class NewsFetcher:
    """Fetches company news from various RSS feeds"""

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

    def fetch_google_news(self, company_name: str, days_back: int = 7) -> List[Dict]:
        """Fetch recent news for a company from Google News RSS"""

        # Build search query with relevant business signals
        search_terms = [
            f'"{company_name}"',
            "(CEO OR CFO OR CTO)",
            "OR funding OR raised OR Series",
            "OR acquisition OR acquired OR merger",
            "OR layoffs OR restructuring",
            "OR partnership OR partners",
        ]

        query = " ".join(search_terms)
        encoded_query = quote_plus(query)

        url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"

        logger.info(f"Fetching news for {company_name} from Google News RSS")

        try:
            feed = feedparser.parse(url)

            # Check if feed was parsed successfully
            if feed.bozo:
                logger.warning(f"Feed parsing had issues: {feed.bozo_exception}")

            articles = []
            cutoff_date = datetime.now() - timedelta(days=days_back)

            for entry in feed.entries[:20]:  # Get more entries, filter later
                # Parse publication date - fixed for feedparser 6.0.11
                pub_date = None

                # Method 1: Use published_parsed if available
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    try:
                        pub_date = datetime.fromtimestamp(
                            time.mktime(entry.published_parsed)
                        )
                    except Exception as e:
                        logger.debug(f"Could not parse published_parsed: {e}")

                # Method 2: Parse the published string if method 1 failed
                if not pub_date and hasattr(entry, "published"):
                    try:
                        # Try parsing common date formats
                        from dateutil import parser as date_parser

                        pub_date = date_parser.parse(entry.published)
                    except Exception as e:
                        logger.debug(f"Could not parse published string: {e}")

                # Skip if we couldn't parse the date
                if not pub_date:
                    logger.debug(
                        f"Skipping article with unparseable date: {entry.get('title', 'Unknown')}"
                    )
                    continue

                # Skip old articles
                if pub_date < cutoff_date:
                    continue

                # Extract clean text from summary
                summary = self._clean_html(entry.get("summary", ""))

                article = {
                    "title": entry.get("title", "No title"),
                    "link": entry.get("link", ""),
                    "published": entry.get("published", "Unknown date"),
                    "pub_date": pub_date,
                    "source": self._extract_source(entry.get("title", "")),
                    "text": f"{entry.get('title', '')}. {summary}",
                }

                articles.append(article)

            logger.info(f"Found {len(articles)} articles for {company_name}")
            return articles

        except Exception as e:
            logger.error(f"Error fetching news for {company_name}: {e}")
            return []

    def fetch_multiple_sources(
        self, company_name: str, days_back: int = 7
    ) -> List[Dict]:
        """Fetch from multiple sources and deduplicate"""

        all_articles = []

        # Google News
        all_articles.extend(self.fetch_google_news(company_name, days_back))

        # Add more sources here in the future
        # all_articles.extend(self.fetch_techcrunch(company_name, days_back))
        # all_articles.extend(self.fetch_bloomberg(company_name, days_back))

        # Deduplicate by title similarity
        unique_articles = self._deduplicate_articles(all_articles)

        # Sort by date, newest first
        unique_articles.sort(
            key=lambda x: x.get("pub_date", datetime.min), reverse=True
        )

        return unique_articles

    def _clean_html(self, html_text: str) -> str:
        """Remove HTML tags and clean text"""
        if not html_text:
            return ""

        soup = BeautifulSoup(html_text, "html.parser")
        text = soup.get_text()

        # Clean up whitespace
        text = " ".join(text.split())

        return text

    def _extract_source(self, title: str) -> str:
        """Extract source from Google News title format"""
        # Google News format: "Article Title - Source Name"
        parts = title.split(" - ")
        if len(parts) >= 2:
            return parts[-1]
        return "Unknown"

    def _deduplicate_articles(self, articles: List[Dict]) -> List[Dict]:
        """Remove duplicate articles based on title similarity"""

        seen_titles = set()
        unique = []

        for article in articles:
            # Simple deduplication by first 50 chars of title
            title_key = article["title"][:50].lower()

            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique.append(article)

        return unique


# Test the fetcher
if __name__ == "__main__":
    fetcher = NewsFetcher()

    test_companies = ["Salesforce", "Databricks", "OpenAI"]

    for company in test_companies:
        print(f"\n{'=' * 60}")
        print(f"News for {company}:")
        print("=" * 60)

        articles = fetcher.fetch_multiple_sources(company, days_back=3)

        if not articles:
            print("No articles found.")
            continue

        for article in articles[:5]:  # Show first 5
            print(f"\n📰 {article['title']}")
            print(f"   Source: {article['source']}")
            print(f"   Date: {article['published']}")
            print(f"   Preview: {article['text'][:150]}...")
