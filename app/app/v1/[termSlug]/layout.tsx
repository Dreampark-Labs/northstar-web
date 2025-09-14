import { notFound } from 'next/navigation';
import { TermSlugValidator } from '@/lib/termSlugUtils';

interface TermSlugLayoutProps {
  children: React.ReactNode;
  params: Promise<{ termSlug: string }>;
}

export default async function TermSlugLayout({ 
  children, 
  params 
}: TermSlugLayoutProps) {
  const { termSlug } = await params;
  
  // Validate the term slug format
  if (!TermSlugValidator.isValidSlug(termSlug)) {
    notFound();
  }

  return (
    <>
      {children}
    </>
  );
}
