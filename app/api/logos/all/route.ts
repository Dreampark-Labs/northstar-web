import { NextResponse } from 'next/server';
import { getLogos, urlFor } from '@/lib/sanity';

export async function GET() {
  try {
    const logos = await getLogos();
    
    const logoMap: Record<string, { imageUrl: string; altText: string; name: string }> = {};
    
    for (const logo of logos) {
      // Generate URLs with higher resolution to prevent blurriness
      const expandedUrl = urlFor(logo.image).width(320).height(64).url(); // 2x resolution
      const collapsedUrl = urlFor(logo.image).width(64).height(64).url(); // 2x resolution
      
      logoMap[logo.variant] = {
        imageUrl: logo.variant.includes('collapsed') ? collapsedUrl : expandedUrl,
        altText: logo.altText,
        name: logo.name
      };
    }
    
    return NextResponse.json({
      success: true,
      data: logoMap
    });
  } catch (error) {
    console.error('Logos API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
