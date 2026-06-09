import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/ingestor/"],
      },
    ],
    sitemap: "https://akalloksewa.vercel.app/sitemap.xml",
    host: "https://akalloksewa.vercel.app",
  };
}
