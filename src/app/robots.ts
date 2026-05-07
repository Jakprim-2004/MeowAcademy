import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/order-status"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/order-status"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/order-status"],
      },
    ],
    sitemap: "https://meow-loan.com/sitemap.xml",
  };
}
