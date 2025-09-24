"use client";

import { CommandPaletteProvider } from '@/providers/CommandPaletteProvider';

export function CommandPaletteProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      {children}
    </CommandPaletteProvider>
  );
}
