import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'End User License Agreement | Northstar',
  description: 'End User License Agreement for Northstar academic productivity platform',
};

export default function EULAPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">End User License Agreement (EULA)</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. License Grant</h2>
          <p>
            Subject to the terms of this Agreement, Northstar grants you a limited, non-exclusive, 
            non-transferable license to use the Northstar application for your personal academic use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Restrictions</h2>
          <p>You may not:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Copy, modify, or distribute the software</li>
            <li>Reverse engineer or decompile the application</li>
            <li>Use the software for commercial purposes without authorization</li>
            <li>Remove or alter any proprietary notices</li>
            <li>Use the software in violation of applicable laws</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property</h2>
          <p>
            Northstar and all related intellectual property rights remain the exclusive property of 
            Dreampark Labs. This license does not grant you any ownership rights in the software.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
          <p>
            You retain ownership of any academic content you create or upload to Northstar. By using 
            our service, you grant us a license to store, process, and display your content as 
            necessary to provide the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Updates and Modifications</h2>
          <p>
            We may update the software from time to time. Updates may include new features, bug fixes, 
            or security improvements. Continued use of the software constitutes acceptance of updates.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
          <p>
            The software is provided "as is" without warranties of any kind, either express or implied, 
            including but not limited to warranties of merchantability, fitness for a particular purpose, 
            or non-infringement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>
            In no event shall Dreampark Labs be liable for any indirect, incidental, special, 
            consequential, or punitive damages, including but not limited to loss of data, loss of 
            profits, or business interruption.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
          <p>
            This license is effective until terminated. You may terminate it at any time by 
            discontinuing use of the software. We may terminate your license if you violate any 
            terms of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
          <p>
            This Agreement shall be governed by and construed in accordance with the laws of the 
            jurisdiction where Dreampark Labs is located, without regard to conflict of law principles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p>
            If you have any questions about this EULA, please contact us at{' '}
            <a href="mailto:legal@northstar.app" className="text-blue-600 hover:underline">
              legal@northstar.app
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
