"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { DocumentIcon, FolderIcon, UploadIcon, SearchIcon } from '@sanity/icons';
import { CustomizableGrid, type GridComponent } from '@/components/layout/CustomizableGrid';
import { useCommandPaletteContext } from '@/providers/CommandPaletteProvider';

export function FilesClient() {
  const searchParams = useSearchParams();
  const { open: openCommandPalette } = useCommandPaletteContext();

  // Handle URL parameters for search modal opening
  useEffect(() => {
    const hasSearch = searchParams.get('search') !== null;
    
    if (hasSearch) {
      openCommandPalette();
    }
  }, [searchParams, openCommandPalette]);

  const folderStatsContent = (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px'
    }}>
      <Card style={{ padding: '16px', textAlign: 'center' }}>
        <FolderIcon style={{ fontSize: '24px', color: 'var(--color-accent)', marginBottom: '8px' }} />
        <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '14px' }}>Documents</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '12px' }}>0 files</div>
      </Card>

      <Card style={{ padding: '16px', textAlign: 'center' }}>
        <FolderIcon style={{ fontSize: '24px', color: 'var(--color-accent)', marginBottom: '8px' }} />
        <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '14px' }}>Assignments</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '12px' }}>0 files</div>
      </Card>

      <Card style={{ padding: '16px', textAlign: 'center' }}>
        <FolderIcon style={{ fontSize: '24px', color: 'var(--color-accent)', marginBottom: '8px' }} />
        <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '14px' }}>Resources</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '12px' }}>0 files</div>
      </Card>

      <Card style={{ padding: '16px', textAlign: 'center' }}>
        <FolderIcon style={{ fontSize: '24px', color: 'var(--color-accent)', marginBottom: '8px' }} />
        <div style={{ fontWeight: 600, marginBottom: '2px', fontSize: '14px' }}>Notes</div>
        <div style={{ color: 'var(--color-muted)', fontSize: '12px' }}>0 files</div>
      </Card>
    </div>
  );

  const gridComponents: GridComponent[] = [
    {
      id: 'recent-files',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardTitle>Recent Files</CardTitle>
              <Button variant="ghost" onClick={() => {
                const newUrl = `${window.location.pathname}?search=true`;
                window.history.pushState({ search: true }, '', newUrl);
                openCommandPalette();
              }}>
                <SearchIcon />
                Search Files
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<DocumentIcon />}
              title="No files uploaded yet"
              description="Upload your academic documents, notes, and resources to get started with file organization."
              action={
                <Button>
                  <UploadIcon />
                  Upload Your First File
                </Button>
              }
            />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 4, h: 2 },
      minSize: { w: 3, h: 1 },
      maxSize: { w: 6, h: 3 }
    },
    {
      id: 'file-storage',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<FolderIcon />}
              title="Storage available"
              description="Track your file storage usage and manage your space."
            />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 },
      minSize: { w: 2, h: 1 },
      maxSize: { w: 4, h: 2 }
    },
    {
      id: 'file-types',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>File Types</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<DocumentIcon />}
              title="No files yet"
              description="File type breakdown will appear once you upload files."
            />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 2, h: 1 },
      minSize: { w: 2, h: 1 },
      maxSize: { w: 4, h: 2 }
    },
    {
      id: 'shared-files',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>Shared Files</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<DocumentIcon />}
              title="No shared files"
              description="Files shared with classmates or study groups will appear here."
            />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 3, h: 1 },
      minSize: { w: 2, h: 1 },
      maxSize: { w: 4, h: 2 }
    },
    {
      id: 'file-activity',
      content: (
        <Card style={{ height: '100%' }}>
          <CardHeader>
            <CardTitle>File Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<DocumentIcon />}
              title="No activity yet"
              description="Recent file uploads, downloads, and modifications will appear here."
            />
          </CardContent>
        </Card>
      ),
      defaultSize: { w: 3, h: 1 },
      minSize: { w: 2, h: 1 },
      maxSize: { w: 4, h: 2 }
    }
  ];

  const actionButton = (
    <Button>
      <UploadIcon />
      Upload Files
    </Button>
  );

  return (
    <CustomizableGrid
      pageId="files"
      pageTitle="Files"
      components={gridComponents}
      actionButton={actionButton}
      showStats={true}
      statsContent={folderStatsContent}
    />
  );
}
