import { ClientAppLayout } from "./ClientAppLayout";

// Simple default app settings for the academic productivity app
const defaultAppSettings = {
  name: "Northstar",
  description: "Academic Productivity Application",
  version: "1.0.0"
};

const defaultFooterSettings = {
  companyName: "Northstar",
  year: new Date().getFullYear()
};

export async function ServerAppLayout({ children }: { children: React.ReactNode }) {
  // Use default settings since this is not a marketing site that needs Sanity CMS
  const appSettings = defaultAppSettings;
  const footerSettings = defaultFooterSettings;

  return (
    <ClientAppLayout 
      appSettings={appSettings}
      footerSettings={footerSettings}
    >
      {children}
    </ClientAppLayout>
  );
}
