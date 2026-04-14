import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
              <Link to="/register">
                <Button variant="outline">Back to Registration</Button>
              </Link>
            </div>
            <p className="text-gray-600 text-sm mt-2">Last updated: April 14, 2026</p>
            <p className="text-gray-600 text-sm">Effective: April 14, 2026</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
              <p className="text-gray-700">
                Marryshow's Mealhouse ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services ("Service"). Please read this policy carefully. By using the Service, you consent to the data practices described herein.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
              <p className="text-gray-700">We may collect the following types of information:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1 mt-2">
                <li><strong>Personal Identifiers:</strong> Name, email address, username, phone number, student ID, profile picture.</li>
                <li><strong>Account Information:</strong> Password (encrypted), wallet balance, order history, preferences, loyalty points.</li>
                <li><strong>Transaction Information:</strong> Order details, payment methods, transaction history, receipts.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system, usage statistics, cookies.</li>
                <li><strong>Location Data:</strong> Approximate location for pickup timing estimates (with your permission).</li>
                <li><strong>Communications:</strong> Messages you send to customer support or reviews you post.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
              <p className="text-gray-700">We use your information to:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1 mt-2">
                <li>Create and manage your account</li>
                <li>Process and fulfill your orders</li>
                <li>Manage your wallet and payments</li>
                <li>Send order confirmations and updates</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our Service and develop new features</li>
                <li>Send promotional communications (you may opt out)</li>
                <li>Detect and prevent fraud, security issues, or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage trends and personalize your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Legal Bases for Processing (GDPR)</h2>
              <p className="text-gray-700">
                If you are in the European Economic Area, we process your personal data based on: (a) performance of a contract; (b) your consent; (c) compliance with legal obligations; or (d) our legitimate interests (e.g., improving the Service, fraud prevention).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Sharing Your Information</h2>
              <p className="text-gray-700">
                We do not sell your personal information. We may share information in these limited circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1 mt-2">
                <li><strong>Service Providers:</strong> Third-party vendors who help with payment processing, analytics, cloud hosting, or email delivery.</li>
                <li><strong>Legal Requirements:</strong> If required by law, court order, or to protect our rights, property, or safety.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                <li><strong>With Your Consent:</strong> When you specifically authorize sharing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Data Security</h2>
              <p className="text-gray-700">
                We implement industry-standard security measures, including encryption (TLS/SSL), firewalls, access controls, and regular security audits, to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure. You use the Service at your own risk. In the event of a data breach, we will notify affected users as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Your Rights and Choices</h2>
              <p className="text-gray-700">Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1 mt-2">
                <li>Access, correct, or delete your personal information</li>
                <li>Object to or restrict processing of your data</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time (where processing is based on consent)</li>
                <li>Opt out of marketing communications (via unsubscribe link or contacting us)</li>
              </ul>
              <p className="text-gray-700 mt-2">
                To exercise these rights, contact us at privacy@tamccdeli.edu. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700">
                We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage, personalize content, and serve relevant ads. You can control cookies through your browser settings, but disabling them may affect functionality. For more details, see our Cookie Policy (available on request).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. Third-Party Links</h2>
              <p className="text-gray-700">
                The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those sites. Please read their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Children's Privacy</h2>
              <p className="text-gray-700">
                Our Service is not directed to individuals under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with data, please contact us, and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information as long as your account is active or as needed to provide services. After account closure, we may retain certain data for legal, tax, fraud prevention, or legitimate business purposes (e.g., order history for warranty claims). Anonymized data may be kept indefinitely for analytics.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">12. International Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your own. We take steps to ensure adequate protection, such as using Standard Contractual Clauses where required. By using the Service, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">13. California Privacy Rights (CPRA)</h2>
              <p className="text-gray-700">
                If you are a California resident, you have the right to request information about the categories of personal data we collect, the sources, the business purpose, and any third parties with whom we share it. You also have the right to opt out of the sale of your personal information (we do not sell it). To exercise your rights, contact us at privacy@tamccdeli.edu.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">14. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this policy from time to time. We will notify you of material changes via email or a prominent notice on the Service. Your continued use after changes constitutes acceptance. The "Last updated" date at the top indicates when the policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">15. Contact Information</h2>
              <p className="text-gray-700">
                For privacy-related questions or to exercise your rights, please contact us:<br />
                Email: privacy@tamccdeli.edu<br />
                Address: TAMCC Campus, St. George's, Grenada<br />
                Data Protection Officer: dpo@tamccdeli.edu<br />
                Phone: +1 (473) 440-2000
              </p>
            </section>

            <div className="pt-4 text-center text-sm text-gray-500">
              <p>Your privacy is important to us. Thank you for trusting Marryshow's Mealhouse.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}