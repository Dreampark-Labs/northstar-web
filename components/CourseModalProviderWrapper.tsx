"use client";

import { CourseModalProvider } from '@/providers/CourseModalProvider';

export function CourseModalProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CourseModalProvider>
      {children}
    </CourseModalProvider>
  );
}
