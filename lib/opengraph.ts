import { Metadata } from 'next'

interface OpenGraphOptions {
  title: string
  description: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  image?: string
  siteName?: string
}

export function generateOpenGraphMetadata({
  title,
  description,
  url,
  type = 'website',
  image,
  siteName = 'NorthStar Web'
}: OpenGraphOptions): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // Generate OG image URL if not provided
  const ogImageUrl = image || `${baseUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&type=${type}`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: url || baseUrl,
      siteName,
      type,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@northstarweb',
      site: '@northstarweb',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export function generatePageMetadata(
  title: string,
  description: string,
  path?: string,
  type?: 'website' | 'article' | 'profile'
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const url = path ? `${baseUrl}${path}` : baseUrl
  
  return generateOpenGraphMetadata({
    title: `${title} | NorthStar Web`,
    description,
    url,
    type,
  })
}
