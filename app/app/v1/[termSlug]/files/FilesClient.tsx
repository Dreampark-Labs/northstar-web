"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { DocumentIcon, FolderIcon, UploadIcon, SearchIcon } from '@sanity/icons';
import { DynamicHead } from '@/components/ui/DynamicHead';
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
      gap: '12px',
      marginBottom: '24px'
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

  return (
    <>
      <DynamicHead 
        titleSuffix="Files"
        description="Organize and manage your academic documents, assignments, and resources"
        keywords={['files', 'documents', 'file management', 'academic resources', 'upload']}
      />
      
      {/* Page Container */}
      <div style={{ 
        padding: '24px', 
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header with Title and Upload Files Button */}
        <div style={{ 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'var(--color-fg)',
            margin: 0
          }}>
            Files
          </h1>
          <Button>
            <UploadIcon />
            Upload Files
          </Button>
        </div>

        {/* Stats Section */}
        {folderStatsContent}

        {/* Fixed Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(7, 1fr)',
          gap: '12px',
          width: '100%',
          flex: 1,
          minHeight: '900px'
        }}>
          {/* Recent Files - 4x4 on the left */}
          <div style={{ gridColumn: '1 / 5', gridRow: '1 / 5' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '480px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
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
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
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
          </div>

          {/* File Types - 2x2 on the top right */}
          <div style={{ gridColumn: '5 / 7', gridRow: '1 / 3' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '240px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
                <CardTitle>File Types</CardTitle>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                <EmptyState
                  icon={<DocumentIcon />}
                  title="No files yet"
                  description="File type breakdown will appear once you upload files."
                />
              </CardContent>
            </Card>
          </div>

          {/* Storage Usage - 2x2 underneath File Types */}
          <div style={{ gridColumn: '5 / 7', gridRow: '3 / 5' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '240px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
                <CardTitle>Storage Usage</CardTitle>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                <EmptyState
                  icon={<FolderIcon />}
                  title="Storage available"
                  description="Track your file storage usage and manage your space."
                />
              </CardContent>
            </Card>
          </div>

          {/* Shared Files - 3x3 on the bottom left */}
          <div style={{ gridColumn: '1 / 4', gridRow: '5 / 8' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '360px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
                <CardTitle>Shared Files</CardTitle>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                <EmptyState
                  icon={<DocumentIcon />}
                  title="No shared files"
                  description="Files shared with classmates or study groups will appear here."
                />
              </CardContent>
            </Card>
          </div>

          {/* File Activity - 3x3 on the bottom right */}
          <div style={{ gridColumn: '4 / 7', gridRow: '5 / 8' }}>
            <Card style={{ 
              height: '100%', 
              minHeight: '360px',
              maxHeight: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader style={{ flexShrink: 0 }}>
                <CardTitle>File Activity</CardTitle>
              </CardHeader>
              <CardContent style={{ 
                padding: 0, 
                flex: 1,
                overflow: 'hidden',
                minHeight: 0
              }}>
                <EmptyState
                  icon={<DocumentIcon />}
                  title="No activity yet"
                  description="Recent file uploads, downloads, and modifications will appear here."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
