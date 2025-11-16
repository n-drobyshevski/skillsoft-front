import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillsoft.com';
  
  const robotsTxt = `# robots.txt for SkillSoft
User-agent: *
Allow: /
Allow: /api/sitemap

# Disallow private areas
Disallow: /dashboard*
Disallow: /sign-in*
Disallow: /sign-up*
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Allow search engines to index public pages
Allow: /competencies
Allow: /behavioral-indicators
Allow: /assessment-questions
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}