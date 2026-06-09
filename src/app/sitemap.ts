import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://akalloksewa.vercel.app";

  const staticPages = [
    "", "/", "/about", "/features", "/pricing", "/blog", "/contact",
    "/auth/login", "/auth/register",
    "/privacy", "/terms", "/cookies", "/disclaimer", "/refund",
    "/dashboard", "/practice", "/test", "/analytics", "/leaderboard",
    "/syllabus", "/notes", "/bookmarks", "/settings", "/profile",
    "/onboarding", "/ingestor",
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" || route === "/" ? 1 : route.startsWith("/auth") ? 0.5 : 0.8,
  }));
}
