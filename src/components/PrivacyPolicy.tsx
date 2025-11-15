import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full-dec-hf  x-2 bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-medium">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-md shadow-md border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-slate-700 mb-4">
                Welcome to Omni Share ("we," "our," or "us"). We are committed
                to protecting your privacy and ensuring the security of your
                personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our AI-powered social media content generation platform.
              </p>
              <p className="text-slate-700">
                By accessing or using our service, you agree to the collection
                and use of information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-slate-800 mb-3">
                2.1 Personal Information
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700">
                <li>Account information (name, email address, password)</li>
                <li>Profile information and preferences</li>
                <li>
                  Social media account connections and authorization tokens
                </li>
                <li>
                  Billing and payment information (processed securely through
                  third-party payment processors)
                </li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">
                2.2 Content Data
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700">
                <li>Content you create, generate, or upload</li>
                <li>AI prompts and inputs</li>
                <li>Generated social media posts, images, and schedules</li>
                <li>Campaign data and analytics</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">
                2.3 Technical Data
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage patterns and feature interactions</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-slate-700">
                <li>Provide and maintain our AI content generation services</li>
                <li>Process and fulfill your content creation requests</li>
                <li>Improve and optimize our AI models and algorithms</li>
                <li>Personalize your experience and content recommendations</li>
                <li>
                  Connect and post to your authorized social media accounts
                </li>
                <li>Send service-related communications and updates</li>
                <li>
                  Analyze usage patterns to enhance platform functionality
                </li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations and resolve disputes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                4. AI and Machine Learning
              </h2>
              <p className="text-slate-700 mb-4">
                Our platform uses advanced AI technologies, including large
                language models and image generation systems. Here's how we
                handle your data in relation to AI processing:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700">
                <li>
                  Your content inputs may be processed by third-party AI
                  services (OpenAI, Anthropic, Google AI)
                </li>
                <li>
                  We may use anonymized and aggregated data to improve our AI
                  models
                </li>
                <li>
                  Personal content is not used to train external AI models
                  without your consent
                </li>
                <li>AI-generated content remains your intellectual property</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                5. Social Media Integration
              </h2>
              <p className="text-slate-700 mb-4">
                When you connect your social media accounts, we:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700">
                <li>Store only necessary authorization tokens securely</li>
                <li>Access only the permissions you explicitly grant</li>
                <li>Post content only with your explicit approval</li>
                <li>Never store your social media passwords</li>
                <li>Allow you to revoke access at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                6. Data Sharing and Third Parties
              </h2>
              <p className="text-slate-700 mb-4">
                We may share your information with:
              </p>

              <h3 className="text-xl font-medium text-slate-800 mb-3">
                6.1 Service Providers
              </h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700">
                <li>AI service providers (OpenAI, Anthropic, Google AI)</li>
                <li>Cloud hosting and database services (Supabase)</li>
                <li>Payment processors</li>
                <li>Analytics and monitoring services</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">
                6.2 Legal Requirements
              </h3>
              <p className="text-slate-700 mb-4">
                We may disclose information if required by law, regulation, or
                legal process.
              </p>

              <h3 className="text-xl font-medium text-slate-800 mb-3">
                6.3 Business Transfers
              </h3>
              <p className="text-slate-700">
                In case of merger, acquisition, or sale of assets, user
                information may be transferred.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                7. Data Security
              </h2>
              <p className="text-slate-700 mb-4">
                We implement robust security measures:
              </p>
              <ul className="list-disc pl-6 text-slate-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication protocols</li>
                <li>Secure API integrations</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                8. Your Rights and Choices
              </h2>
              <p className="text-slate-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-slate-700">
                <li>Access, update, or delete your personal information</li>
                <li>Download your data in a portable format</li>
                <li>Opt-out of marketing communications</li>
                <li>Disconnect social media accounts</li>
                <li>Request restriction of data processing</li>
                <li>Object to automated decision-making</li>
                <li>Lodge a complaint with regulatory authorities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                9. Data Retention
              </h2>
              <p className="text-slate-700 mb-4">
                We retain your information only as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-slate-700">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our services (using anonymized data)</li>
              </ul>
              <p className="text-slate-700 mt-4">
                You can request deletion of your account and associated data at
                any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                10. International Data Transfers
              </h2>
              <p className="text-slate-700">
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your data in accordance with this
                privacy policy and applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                11. Children's Privacy
              </h2>
              <p className="text-slate-700">
                Our service is not intended for individuals under 18 years of
                age. We do not knowingly collect personal information from
                children under 18. If you are a parent or guardian and believe
                your child has provided us with personal information, please
                contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                12. Updates to This Policy
              </h2>
              <p className="text-slate-700">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date. We encourage you
                to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                13. Contact Us
              </h2>
              <p className="text-slate-700 mb-4">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-slate-700 mb-2">
                  <strong>Email:</strong> privacy@socialaiagent.com
                </p>
                <p className="text-slate-700 mb-2">
                  <strong>Address:</strong> [Your Company Address]
                </p>
                <p className="text-slate-700">
                  <strong>Phone:</strong> [Your Contact Number]
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                14. Consent
              </h2>
              <p className="text-slate-700">
                By using our service, you consent to our Privacy Policy and
                agree to its terms. If you do not agree with this policy, please
                do not use our service.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 font-medium text-sm">
            This privacy policy is effective as of{" "}
            {new Date().toLocaleDateString()} and applies to all users of Omni
            Share.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
