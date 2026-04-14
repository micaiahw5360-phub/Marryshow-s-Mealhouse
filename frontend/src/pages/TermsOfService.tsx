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
            <p className="text-gray-600 text-sm mt-2">Last updated: April 14, 2026</p>
            <p className="text-gray-600 text-sm">Effective: April 14, 2026</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using Marryshow's Mealhouse's website, mobile application, or services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service. These Terms constitute a legally binding agreement between you and Marryshow's Mealhouse.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
              <p className="text-gray-700">
                You must be at least 13 years old to use the Service. By using the Service, you represent and warrant that you meet this age requirement. If you are under 18, you represent that you have parental or guardian consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Account Registration and Security</h2>
              <p className="text-gray-700">
                To access certain features, you must register for an account. You agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your password and for all activities under your account. You must notify us immediately of any unauthorized use. We reserve the right to suspend or terminate accounts that violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Orders and Payments</h2>
              <p className="text-gray-700">
                When you place an order, you agree to pay the stated price including any applicable taxes or fees. We reserve the right to refuse or cancel any order for reasons including but not limited to product availability, errors in pricing, or suspected fraud. Payments are processed through secure third-party gateways. By placing an order, you authorize us to charge your selected payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Marryshow Wallet and Virtual Balance</h2>
              <p className="text-gray-700">
                The Marryshow Wallet is a stored value account that allows you to add funds and pay for orders. Wallet balances are non‑transferable and not redeemable for cash unless required by law. Funds added to the wallet are not interest‑bearing. We reserve the right to adjust balances due to technical errors, fraudulent activity, or chargebacks. You may request a refund of your wallet balance in accordance with applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Cancellations and Refunds</h2>
              <p className="text-gray-700">
                Orders may be cancelled within 5 minutes of placement. Once preparation begins, cancellations may not be possible. Refunds for cancelled orders will be issued to your wallet balance. For quality issues with prepared orders, please contact our staff for resolution. Refunds for credit/debit card payments will be processed to the original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Prohibited Conduct</h2>
              <p className="text-gray-700">
                You agree not to: (a) use the Service for any illegal purpose; (b) attempt to gain unauthorized access to any part of the Service; (c) interfere with or disrupt the Service or servers; (d) harass, abuse, or harm another person; (e) impersonate any person or entity; (f) upload malicious code or content; (g) use any automated system to access the Service; (h) violate any applicable laws or regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">8. Intellectual Property</h2>
              <p className="text-gray-700">
                All content on the Service, including text, graphics, logos, images, software, and trademarks, is the property of Marryshow's Mealhouse or its licensors and is protected by copyright, trademark, and other laws. You may not reproduce, distribute, modify, create derivative works, or publicly display any content without our prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">9. User Content</h2>
              <p className="text-gray-700">
                You may submit reviews, comments, or other content. By submitting content, you grant us a non‑exclusive, royalty‑free, perpetual, irrevocable license to use, reproduce, modify, and display such content in connection with the Service. You represent that you own or have permission to submit the content and that it does not violate any third‑party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">10. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice, for conduct that violates these Terms or is harmful to other users or us. Upon termination, your right to use the Service will cease. You may close your account at any time by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">11. Disclaimer of Warranties</h2>
              <p className="text-gray-700">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON‑INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR‑FREE, OR SECURE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">12. Limitation of Liability</h2>
              <p className="text-gray-700">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MARRYSHOW'S MEALHOUSE AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST SIX MONTHS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">13. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless Marryshow's Mealhouse and its affiliates from any claims, damages, losses, liabilities, costs, or expenses (including reasonable attorneys' fees) arising out of your use of the Service, violation of these Terms, or infringement of any third‑party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">14. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700">
                These Terms shall be governed by the laws of Grenada, without regard to its conflict of law provisions. Any dispute arising from these Terms or your use of the Service shall be resolved through binding arbitration in Grenada, unless the dispute qualifies for small claims court. You waive the right to participate in a class action.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">15. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. We will notify you of material changes via email or through the Service. Your continued use after changes constitutes acceptance. It is your responsibility to review these Terms periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">16. Contact Information</h2>
              <p className="text-gray-700">
                If you have questions about these Terms, please contact us at:<br />
                Email: legal@tamccdeli.edu<br />
                Address: TAMCC Campus, St. George's, Grenada<br />
                Phone: +1 (473) 440-2000
              </p>
            </section>

            <div className="pt-4 text-center text-sm text-gray-500">
              <p>By using Marryshow's Mealhouse, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}