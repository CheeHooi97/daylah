# DayLah search setup

The public website origin is `https://daylah.my`, configured in `frontend/.env.production`. A deployment `PUBLIC_SITE_URL` environment variable takes precedence. The build generates unique titles, descriptions, headings and explanatory HTML for all five calculator pages, social metadata, canonical URLs, WebSite/WebApplication JSON-LD, `robots.txt` and `sitemap.xml`.

Only `/`, `/between-dates/`, `/until/`, `/age/` and `/anniversary/` appear in the sitemap. Shared countdowns use a separate static page with `noindex,nofollow` and an HTTP indexing header. Query URLs get the same HTTP header and a client-side indexing rule. They remain crawlable so search engines can read that rule. API endpoints are excluded from crawling. Deploy using the updated nginx configuration; a static host needs equivalent share routing and query headers.

After deploying the website with HTTPS:

1. Verify `https://daylah.my/robots.txt` and `https://daylah.my/sitemap.xml` return the generated files.
2. Add the `daylah.my` Domain property in Google Search Console and verify ownership using the supplied DNS TXT record.
3. Submit `https://daylah.my/sitemap.xml` in the Sitemaps screen.
4. Use URL Inspection on each calculator and confirm the rendered page, canonical and indexing status. Check a shared countdown is excluded.
5. Review Page Indexing and Core Web Vitals after Google has crawled the site.

Search Console submission and DNS verification require access to the owner's accounts. Sitemap submission helps discovery; it does not guarantee indexing or ranking. No analytics, invented review ratings, or search-result claims are included.

References: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
