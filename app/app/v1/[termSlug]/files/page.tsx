import type { Metadata } from "next";
import { generatePageMetadata } from '@/lib/metadata';
import { FilesClient } from './FilesClient';

// Generate metadata for the files page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata(
    'Files',
    'Organize and manage your academic documents, assignments, and resources',
    ['files', 'documents', 'file management', 'academic resources', 'upload']
  );
}

export default function FilesPage() {
  return <FilesClient />;
}
