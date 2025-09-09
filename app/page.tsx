import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';

export default function Dashboard() {
  return (
    <div style={{ padding: '24px', maxWidth: '1120px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}>
          Dashboard
        </h1>
        <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '16px' }}>
          Welcome to Northstar! Your academic productivity dashboard.
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '32px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '32px', margin: 0 }}>
                No assignments due this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Due Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '32px', margin: 0 }}>
                No assignments due soon
              </p>
            </CardContent>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <CardHeader>
              <CardTitle>Grades Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '32px', margin: 0 }}>
                No courses with grades yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Files</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '32px', margin: 0 }}>
                No files uploaded yet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--color-fg)' }}>
          Get Started
        </h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
          Create your first term to start tracking your academic progress
        </p>
        <Button>Create Your First Term</Button>
      </div>
    </div>
  );
}
