import { generateLegalPageMetadata } from '@/lib/metadata';
import styles from './cookies.module.css';

export const generateMetadata = () => generateLegalPageMetadata('Cookie Policy');

export default function CookiesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1>Cookie Policy</h1>
          <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
        </header>

        <section className={styles.section}>
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit our website. They help us provide 
            you with a better experience by remembering your preferences, analyzing how you use our site, and improving our services.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Types of Cookies We Use</h2>

          <div className={styles.cookieCategory}>
            <h3>Necessary Cookies</h3>
            <div className={styles.categoryBadge}>Always Active</div>
            <p>
              These cookies are essential for the website to function properly. They enable basic features like page navigation, 
              access to secure areas of the website, and remember your login status. The website cannot function properly without these cookies.
            </p>
            <div className={styles.examples}>
              <strong>Examples:</strong>
              <ul>
                <li>Authentication tokens</li>
                <li>Session management</li>
                <li>Security cookies</li>
                <li>Load balancing</li>
              </ul>
            </div>
          </div>

          <div className={styles.cookieCategory}>
            <h3>Analytics Cookies</h3>
            <div className={styles.categoryBadge}>Optional</div>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting information 
              anonymously. This helps us analyze site traffic, identify popular content, and improve our services.
            </p>
            <div className={styles.examples}>
              <strong>Examples:</strong>
              <ul>
                <li>Google Analytics</li>
                <li>Page view tracking</li>
                <li>User behavior analysis</li>
                <li>Performance monitoring</li>
              </ul>
            </div>
          </div>

          <div className={styles.cookieCategory}>
            <h3>Marketing Cookies</h3>
            <div className={styles.categoryBadge}>Optional</div>
            <p>
              These cookies are used to deliver advertisements that are relevant to you and your interests. They may also be 
              used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
            </p>
            <div className={styles.examples}>
              <strong>Examples:</strong>
              <ul>
                <li>Google Ads</li>
                <li>Facebook Pixel</li>
                <li>Retargeting cookies</li>
                <li>Conversion tracking</li>
              </ul>
            </div>
          </div>

          <div className={styles.cookieCategory}>
            <h3>Preference Cookies</h3>
            <div className={styles.categoryBadge}>Optional</div>
            <p>
              These cookies remember your settings and preferences, such as your language choice, region, or theme preference, 
              to provide a more personalized experience on future visits.
            </p>
            <div className={styles.examples}>
              <strong>Examples:</strong>
              <ul>
                <li>Theme preferences (light/dark mode)</li>
                <li>Language settings</li>
                <li>Layout preferences</li>
                <li>Notification settings</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Cookie Duration</h2>
          
          <h3>Session Cookies</h3>
          <p>
            These are temporary cookies that expire when you close your browser. They are used for essential functions 
            like maintaining your login session.
          </p>

          <h3>Persistent Cookies</h3>
          <p>
            These cookies remain on your device for a set period or until you delete them. They remember your preferences 
            and settings for future visits.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Third-Party Cookies</h2>
          <p>
            Some cookies are set by third-party services that appear on our pages. We use reputable third-party services for:
          </p>
          <ul>
            <li><strong>Analytics:</strong> Google Analytics for website traffic analysis</li>
            <li><strong>Content Delivery:</strong> CDN services for faster loading times</li>
            <li><strong>Authentication:</strong> OAuth providers for secure login</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Managing Your Cookie Preferences</h2>
          
          <div className={styles.managementOptions}>
            <h3>Through Our Cookie Banner</h3>
            <p>
              When you first visit our site, you'll see a cookie consent banner where you can choose which types of cookies 
              to accept. You can change your preferences at any time by clicking the cookie settings link in our footer.
            </p>

            <h3>Through Your Browser</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul>
              <li>View what cookies are stored</li>
              <li>Delete existing cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies (may affect site functionality)</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Browser-Specific Instructions</h2>
          
          <div className={styles.browserInstructions}>
            <div className={styles.browserItem}>
              <h4>Chrome</h4>
              <p>Settings → Privacy and Security → Cookies and other site data</p>
            </div>
            
            <div className={styles.browserItem}>
              <h4>Firefox</h4>
              <p>Preferences → Privacy & Security → Cookies and Site Data</p>
            </div>
            
            <div className={styles.browserItem}>
              <h4>Safari</h4>
              <p>Preferences → Privacy → Manage Website Data</p>
            </div>
            
            <div className={styles.browserItem}>
              <h4>Edge</h4>
              <p>Settings → Cookies and site permissions → Cookies and site data</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Impact of Disabling Cookies</h2>
          <p>
            While you can browse our website with cookies disabled, some features may not work properly:
          </p>
          <ul>
            <li>You may need to log in repeatedly</li>
            <li>Your preferences won't be remembered</li>
            <li>Some interactive features may not function</li>
            <li>We won't be able to personalize your experience</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, 
            legal, or regulatory reasons. Please check this page regularly for updates.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact Us</h2>
          <p>
            If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
          </p>
          <div className={styles.contact}>
            <p>Email: privacy@northstar-app.com</p>
            <p>Privacy Policy: <a href="/privacy" className={styles.link}>View our Privacy Policy</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
