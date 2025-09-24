import { NextResponse } from 'next/server';
import { getLogoByVariant, urlFor } from '@/lib/sanity';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ variant: string }> }
) {
  try {
    const { variant } = await params;
    
    // Validate variant
    const validVariants = ['expanded-regular', 'expanded-dark', 'collapsed-regular', 'collapsed-dark'];
    if (!validVariants.includes(variant)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid variant'
      }, { status: 400 });
    }
    
    const logo = await getLogoByVariant(variant);
    
    if (!logo) {
      return NextResponse.json({
        success: false,
        error: 'Logo not found'
      }, { status: 404 });
    }
    
    // Generate the image URL
    const imageUrl = urlFor(logo.image).width(160).height(32).url();
    
    return NextResponse.json({
      success: true,
      data: {
        ...logo,
        imageUrl
      }
    });
  } catch (error) {
    console.error('Logo API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
