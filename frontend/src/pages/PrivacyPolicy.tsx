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
            <p className="text-gray-600 text-sm mt-2">Last updated: April 7, 2026</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
              <p className="text-gray-700">
                Marryshow's Mealhouse ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services ("Service"). Please read this policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
              <p className="text-gray-700">We may collect the following types of information:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1 mt-2">
                <li><strong>Personal Information:</strong> Name, email address, username, phone number, and profile picture.</li>
                <li><strong>Account Information:</strong> Password (encrypted), wallet balance, order history, and preferences.</li>
                <li><strong>Transaction Information:</strong> Order details, payment methods, and transaction history.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and usage statistics.</li>
                <li><strong>Location Data:</strong> Approximate location for pickup timing estimates (with your permission).</li>
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
                <li>Provide customer support</li>
                <li>Improve our Service and develop new features</li>
                <li>Send promotional communications (you may opt out)</li>
                <li>Detect and prevent fraud or security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Sharing Your Information</h2>
              <p className="text-gray-700">
                We do not sell your personal information. We may share information in these limited circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1 mt-2">
                <li><strong>Service Providers:</strong> Third-party vendors who help with payment processing, analytics, or cloud hosting.</li>
                <li><strong>Legal Requirements:</strong> If required by law or to protect our rights, property, or safety.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                <li><strong>With Your Consent:</strong> When you specifically authorize sharing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Data Security</h2>
              <p className="text-gray-700">
                We implement industry-standard security measures, including encryption, firewalls, and access controls, to protect your information. However, no method of transmission over the Internet is 100% secure. You use the Service at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Your Rights and Choices</h2>
              <p className="text-gray-700">Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1 mt-2">
                <li>Access, correct, or delete your personal information</li>
                <li>Object to or restrict processing of your data</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
                <li>Opt out of marketing communications</li>
              </ul>
              <p className="text-gray-700 mt-2">
                To exercise these rights, contact us at privacy@tamccdeli.edu.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Cookies and Tracking</h2>
              <p className="text-gray-700">
                We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can control cookies through your browser settings, but disabling them may affect functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Third-Party Links</h2>
              <p className="text-gray-700">
                The Service may contain links to third-party websites. We are not responsible for the privacy practices of those sites. Please read their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our Service is not directed to individuals under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information as long as your account is active or as needed to provide services. After account closure, we may retain certain data for legal, tax, or fraud prevention purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. International Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your own. We take steps to ensure adequate protection for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this policy from time to time. We will notify you of material changes via email or a prominent notice on the Service. Your continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">13. Contact Information</h2>
              <p className="text-gray-700">
                For privacy-related questions or to exercise your rights, please contact us:<br />
                Email: privacy@tamccdeli.edu<br />
                Address: TAMCC Campus, Grenada<br />
                Data Protection Officer: dpo@tamccdeli.edu
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