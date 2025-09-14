export const siteConfig = {
  name: "Your Product Name",
  description: "Transform your workflow with our innovative digital solution.",
  url: "https://yourproduct.com",
  ogImage: "https://yourproduct.com/og.jpg",
  links: {
    twitter: "https://twitter.com/yourproduct",
    github: "https://github.com/yourcompany/yourproduct",
    linkedin: "https://linkedin.com/company/yourcompany",
    discord: "https://discord.gg/yourproduct",
  },
  company: {
    name: "Your Company",
    email: "hello@yourcompany.com",
    address: "123 Main St, City, State 12345",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://app.yourcompany.com",
    demoUrl: "/demo",
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_GA_ID ? true : false,
    sanity: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? true : false,
  }
}

