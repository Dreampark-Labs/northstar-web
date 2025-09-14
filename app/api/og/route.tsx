import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get parameters from URL
    const hasTitle = searchParams.has('title')
    const title = hasTitle
      ? searchParams.get('title')?.slice(0, 100)
      : 'NorthStar Web'
    
    const hasDescription = searchParams.has('description')
    const description = hasDescription
      ? searchParams.get('description')?.slice(0, 200)
      : 'Academic Productivity Platform'

    const hasType = searchParams.has('type')
    const type = hasType ? searchParams.get('type') : 'website'

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            padding: '40px',
          }}
        >
          {/* Logo/Brand area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  background: 'white',
                  borderRadius: '6px',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                opacity: 0.9,
              }}
            >
              NorthStar
            </span>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            <h1
              style={{
                fontSize: title && title.length > 50 ? '48px' : '64px',
                fontWeight: 'bold',
                margin: '0 0 24px 0',
                lineHeight: '1.2',
              }}
            >
              {title}
            </h1>
            
            {description && (
              <p
                style={{
                  fontSize: '24px',
                  margin: '0',
                  opacity: 0.8,
                  lineHeight: '1.4',
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.6,
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {type === 'article' ? '📚' : type === 'profile' ? '👤' : '🌟'} {type}
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: unknown) {
    console.log(`${e instanceof Error ? e.message : 'Unknown error'}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
