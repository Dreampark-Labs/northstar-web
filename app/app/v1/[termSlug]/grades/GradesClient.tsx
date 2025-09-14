"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Trophy } from 'lucide-react';

export function GradesClient() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grades</h1>
          <p className="text-muted-foreground mt-1">
            Track your academic performance, GPA, and course grades
          </p>
        </div>
        <Button variant="secondary">
          Customize
        </Button>
      </div>

      {/* GPA Overview */}
      <Card>
        <CardHeader>
          <CardTitle>GPA Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">GPA calculation coming soon</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Your GPA will be calculated automatically based on your completed assignments and grades.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Grades */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Grades</CardTitle>
            <Button variant="outline" size="sm">
              Search Grades
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Trophy />}
            title="No grades available"
            description="Your course grades and assignment scores will appear here as they become available."
          />
        </CardContent>
      </Card>
    </div>
  );
}
