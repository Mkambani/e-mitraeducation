
import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Terms and Conditions</h1>
        <p className="text-slate-500 dark:text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p>Welcome to NearMe. These terms and conditions outline the rules and regulations for the use of our website and services.</p>
        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use NearMe if you do not agree to take all of the terms and conditions stated on this page.</p>

        <h2 id="interpretation">1. Interpretation and Definitions</h2>
        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

        <h2 id="license">2. License</h2>
        <p>Unless otherwise stated, NearMe and/or its licensors own the intellectual property rights for all material on our platform. All intellectual property rights are reserved. You may access this from NearMe for your own personal use subjected to restrictions set in these terms and conditions.</p>
        <p>You must not:</p>
        <ul>
          <li>Republish material from NearMe</li>
          <li>Sell, rent or sub-license material from NearMe</li>
          <li>Reproduce, duplicate or copy material from NearMe</li>
          <li>Redistribute content from NearMe</li>
        </ul>
        
        <h2 id="user-accounts">3. User Accounts</h2>
        <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
        <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party social media service.</p>
        
        <h2 id="bookings">4. Bookings and Payments</h2>
        <p>By placing a booking for a service, you warrant that you are legally capable of entering into binding contracts. You are responsible for providing accurate information for the service application, including any required documentation.</p>
        <p>All fees are quoted in Indian Rupees (INR). Payment must be made at the time of booking, unless a "Cash on Delivery" option is available and selected. We reserve the right to refuse or cancel your booking at any time for certain reasons including but not limited to: service availability, errors in the description or price of the service, or error in your booking.</p>

        <h2 id="termination">5. Termination</h2>
        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms and Conditions.</p>
        <p>Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service.</p>
        
        <h2 id="limitation">6. Limitation of Liability</h2>
        <p>In no event shall NearMe, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

        <h2 id="changes">7. Changes to These Terms</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
        
        <h2 id="contact">8. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:legal@nearme.gov">legal@nearme.gov</a>.</p>
      </div>
    </div>
  );
};

export default TermsPage;
