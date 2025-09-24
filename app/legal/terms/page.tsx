import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Northstar',
  description: 'Terms of Service for Northstar academic productivity platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By creating an account or using Northstar, you agree to be bound by these Terms of Service 
            and our Privacy Policy. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>
            Northstar is an academic productivity platform designed to help students manage their 
            coursework, assignments, and academic schedules. Our service includes features for 
            course management, assignment tracking, calendar integration, and academic analytics.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account information and 
            for all activities that occur under your account. You agree to provide accurate and 
            complete information when creating your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Privacy and Data</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy to understand how we 
            collect, use, and protect your information. By using our service, you consent to the 
            collection and use of your information as described in our Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Transmit any harmful or malicious code</li>
            <li>Interfere with or disrupt the service</li>
            <li>Access another user's account without permission</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p>
            Northstar is provided "as is" without warranties of any kind. We shall not be liable for 
            any indirect, incidental, special, consequential, or punitive damages resulting from your 
            use of the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of significant 
            changes via email or through the service. Continued use of the service after changes 
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@northstar.app" className="text-blue-600 hover:underline">
              legal@northstar.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
