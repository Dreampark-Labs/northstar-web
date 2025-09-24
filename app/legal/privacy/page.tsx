import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Northstar',
  description: 'Privacy Policy for Northstar academic productivity platform',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Account information (name, email address)</li>
            <li>Academic information (courses, assignments, grades)</li>
            <li>Usage data and analytics</li>
            <li>Device and technical information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Provide and improve our services</li>
            <li>Personalize your academic experience</li>
            <li>Send important updates and notifications</li>
            <li>Analyze usage patterns and performance</li>
            <li>Ensure security and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibond mb-4">3. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share 
            your information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist in our operations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of 
            transmission over the internet is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Opt out of certain communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies and Analytics</h2>
          <p>
            We use cookies and similar technologies to enhance your experience and analyze usage 
            patterns. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material 
            changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@northstar.app" className="text-blue-600 hover:underline">
              privacy@northstar.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
