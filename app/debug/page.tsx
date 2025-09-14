import { ConvexConnectionTest } from '@/components/ConvexConnectionTest';

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Debug - Convex Connection</h1>
      <ConvexConnectionTest />
    </div>
  );
}
