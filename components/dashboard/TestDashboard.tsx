"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { ClipboardImageIcon, DocumentIcon, CalendarIcon } from '@sanity/icons';
import { Clock, BookOpen } from 'lucide-react';

export function TestDashboard() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Dashboard Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>
          ⚠️ Running in demo mode - Set up Clerk authentication to use real user data
        </p>
      </div>

      {/* Top Stats Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-fg)', marginBottom: '4px' }}>
              0
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '500' }}>
              Active Terms
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-fg)', marginBottom: '4px' }}>
              0
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '500' }}>
              Overdue
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-fg)', marginBottom: '4px' }}>
              0
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '500' }}>
              Due Soon
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-fg)', marginBottom: '4px' }}>
              0
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '500' }}>
              Completed
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* This Week */}
        <Card style={{ gridColumn: 'span 2', minHeight: '300px' }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<CalendarIcon />}
              title="No events this week"
              description="Your schedule will appear here once you add courses and assignments."
            />
          </CardContent>
        </Card>

        {/* Due Soon */}
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock />
              Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Clock />}
              title="All caught up!"
              description="No assignments due in the next week."
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardImageIcon />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<BookOpen />}
              title="No recent activity"
              description="Your completed assignments and course updates will appear here."
            />
          </CardContent>
        </Card>

        {/* Quick Files */}
        <Card>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DocumentIcon />
              Quick Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<DocumentIcon />}
              title="No files uploaded"
              description="Upload and organize your documents here."
            />
          </CardContent>
        </Card>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Get Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '8px' }}>To use the full application with real data:</h3>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
              <li>Sign up for a free Clerk account at <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>clerk.com</a></li>
              <li>Create a new application in your Clerk dashboard</li>
              <li>Copy your publishable key and secret key</li>
              <li>Add them to your <code>.env.local</code> file</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={() => window.open('https://clerk.com', '_blank')}>
              Set up Clerk Authentication
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = '/app/v1/terms'}>
              Explore the App (Demo Mode)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
