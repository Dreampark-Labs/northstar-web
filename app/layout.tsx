import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northstar - Academic Productivity",
  description: "Plan terms, track courses & assignments, manage files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <aside className="sidebar">
            <div style={{ padding: '24px' }}>
              <h1 style={{ color: 'var(--color-accent)', margin: 0, fontSize: '20px' }}>
                Northstar
              </h1>
            </div>
          </aside>
          <main className="main-content">
            <header className="top-header">
              <div style={{ maxWidth: '500px', width: '100%' }}>
                <input 
                  className="input" 
                  placeholder="Search terms, courses, assignments..."
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </header>
            <div className="content-wrapper">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
