// import { ConvexConnectionTest } from '@/components/ConvexConnectionTest';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Debug - Convex Connection</h1>
      {/* <ConvexConnectionTest /> */}
      <p className="text-gray-600">Convex connection debugging has been disabled.</p>
    </div>
  );
}
