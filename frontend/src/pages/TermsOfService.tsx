import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Terms of Service</CardTitle>
              <Link to="/register">
                <Button variant="outline">Back to Registration</Button>
              </Link>
            </div>
            <p className="text-gray-600 text-sm mt-2">Last updated: April 7, 2026</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using Marryshow's Mealhouse's website, mobile application, or services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
              <p className="text-gray-700">
                Marryshow's Mealhouse provides an online ordering platform for food and beverages offered by the Marryshow's Mealhouse cafeteria. Users can browse menu items, place orders, make payments via wallet or other methods, and manage their account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
              <p className="text-gray-700">
                To use certain features, you must register for an account. You agree to provide accurate, current, and complete information. You are responsible for safeguarding your password and for any activities under your account. Notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Orders and Payments</h2>
              <p className="text-gray-700">
                When you place an order, you agree to pay the stated price including any applicable taxes. We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, errors in pricing, or suspected fraud. Payments are processed through secure third-party gateways.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Wallet and Virtual Balance</h2>
              <p className="text-gray-700">
                You may add funds to your Marryshow's Mealhouse wallet. Wallet balances are non-transferable and not redeemable for cash unless required by law. We reserve the right to adjust balances due to technical errors or fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Cancellations and Refunds</h2>
              <p className="text-gray-700">
                Orders may be cancelled within 5 minutes of placement. After preparation begins, cancellations may not be possible. Refunds for cancelled orders will be issued to your wallet balance. For issues with prepared orders, please contact our staff.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Prohibited Conduct</h2>
              <p className="text-gray-700">
                You agree not to: (a) use the Service for any illegal purpose; (b) attempt to gain unauthorized access to any part of the Service; (c) interfere with or disrupt the Service or servers; (d) harass, abuse, or harm another person; (e) impersonate any person or entity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Intellectual Property</h2>
              <p className="text-gray-700">
                All content on the Service, including text, graphics, logos, images, and software, is the property of Marryshow's Mealhouse or its licensors and is protected by copyright and other laws. You may not reproduce, distribute, or create derivative works without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice, for conduct that violates these Terms or is harmful to other users or us. Upon termination, your right to use the Service will cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Disclaimer of Warranties</h2>
              <p className="text-gray-700">
                The Service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. Limitation of Liability</h2>
              <p className="text-gray-700">
                To the maximum extent permitted by law, Marryshow's Mealhouse shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">12. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by the laws of Grenada, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">13. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">14. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about these Terms, please contact us at:<br />
                Email: support@tamccdeli.edu<br />
                Address: TAMCC Campus, Grenada
              </p>
            </section>

            <div className="pt-4 text-center text-sm text-gray-500">
              <p>By using Marryshow's Mealhouse, you acknowledge that you have read and understood these Terms of Service.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}