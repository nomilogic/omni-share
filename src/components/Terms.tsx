import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="  x-2 bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#7650e3] hover:text-[#6840c7] mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-[#7650e3] mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-500 font-medium">
            <strong>OmniShare</strong> – Social Media Management Platform
          </p>
          <p className="text-gray-500 font-medium">
            <strong>Last Updated:</strong> November 17, 2025
          </p>
          <p className="text-gray-500 font-medium">
            <strong>Company Location:</strong> United Arab Emirates (UAE)
          </p>
        </div>

        {/* Content */}
     
            <section>
              <p className="mb-4">Welcome to <strong>OmniShare</strong>. These Terms of Service ("Terms") govern your use of our website, mobile app, and services (collectively, the "Service"). By accessing or using OmniShare, you agree to be bound by these Terms. If you do not agree, please do not use our Service.</p>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">1. Definitions</h2>
              <ul className="list-disc pl-6 mb-2">
                <li><strong>Service:</strong> Includes OmniShare's website, mobile applications, APIs, and all related features.</li>
                <li><strong>User, "you," or "your":</strong> Refers to any individual or organization accessing the Service.</li>
                <li><strong>Content:</strong> Means any posts, images, videos, text, or data you create or upload to the Service.</li>
                <li><strong>Platform:</strong> Refers to the social media networks we integrate with (Facebook, Instagram, TikTok, YouTube, LinkedIn).</li>
              </ul>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">2. User Eligibility</h2>
              <p className="mb-2">You must meet the following requirements to use OmniShare:</p>
              <ul className="list-disc pl-6">
                <li><strong>Age:</strong> You must be at least 18 years old.</li>
                <li><strong>Legal Capacity:</strong> You must have the legal authority to enter into binding agreements.</li>
                <li><strong>No Violations:</strong> You agree not to use the Service for any illegal or unauthorized purpose.</li>
              </ul>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">3. User Accounts & Credentials</h2>
              <p className="mb-2">When creating an account:</p>
              <ul className="list-disc pl-6 mb-2">
                <li><strong>Accurate Information:</strong> You must provide truthful and complete information during registration.</li>
                <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your password and account.</li>
                <li><strong>Unauthorized Access:</strong> You must notify us immediately if you suspect unauthorized account access.</li>
                <li><strong>Account Liability:</strong> You are liable for all activities conducted through your account.</li>
              </ul>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">4. User Responsibilities & Acceptable Use</h2>
              <p className="mb-2">You agree NOT to:</p>
              <ul className="list-disc pl-6 mb-2">
                <li><strong>Violate Laws:</strong> Use the Service in violation of any laws or regulations.</li>
                <li><strong>Create Harmful Content:</strong> Upload content that is defamatory, obscene, or violates third-party rights.</li>
                <li><strong>Spam or Harassment:</strong> Send unsolicited messages or engage in harassment.</li>
                <li><strong>Unauthorized Access:</strong> Attempt to hack, bypass security measures, or unauthorized data access.</li>
                <li><strong>Competitive Activities:</strong> Use the Service to develop competing products or services.</li>
                <li><strong>Misrepresentation:</strong> Impersonate others or mislead about your identity.</li>
              </ul>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">5. Content Ownership & Rights</h2>
              <p className="mb-2"><strong>Your Content:</strong> You retain ownership of all content you create or upload. By uploading content, you grant OmniShare a non-exclusive, royalty-free license to use, display, and distribute your content for the purpose of providing the Service.</p>
              <p className="mb-2"><strong>Our Content:</strong> All intellectual property on OmniShare (including software, designs, text, logos) is owned by OmniShare. You may not reproduce, modify, or distribute our content without permission.</p>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">6. Platform Integration & Third-Party Services</h2>
              <p className="mb-2">OmniShare integrates with third-party social media platforms. You agree to:</p>
              <ul className="list-disc pl-6 mb-2">
                <li><strong>Comply with Platform Terms:</strong> Follow the terms and policies of each platform (Facebook, Instagram, TikTok, etc.).</li>
                <li><strong>Authorized Access:</strong> Only authorize OmniShare to post content on your behalf.</li>
                <li><strong>No Warranty:</strong> OmniShare is not responsible for platform outages, policy changes, or data loss.</li>
              </ul>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">7. Subscription & Payments</h2>
              <p className="mb-2"><strong>Billing:</strong> Subscription fees are billed according to your chosen plan. All fees are exclusive of applicable taxes.</p>
              <p className="mb-2"><strong>Renewal:</strong> Subscriptions automatically renew unless canceled before the renewal date.</p>
              <p className="mb-2"><strong>Cancellation:</strong> You may cancel your subscription anytime through your account settings. Refunds will not be issued for partial months.</p>
              <p className="mb-2"><strong>Payment Security:</strong> We process payments through secure third-party providers and do not store full credit card information.</p>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">8. Limitation of Liability</h2>
              <p className="mb-2">TO THE FULLEST EXTENT PERMITTED BY LAW, OMNISHARE IS PROVIDED "AS-IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</p>
              <p className="mb-2">OmniShare shall NOT be liable for:</p>
              <ul className="list-disc pl-6 mb-2">
                <li><strong>Indirect, incidental, consequential, or punitive damages.</strong></li>
                <li><strong>Loss of data, revenue, or business opportunities.</strong></li>
                <li><strong>Third-party platform actions or policy changes.</strong></li>
                <li><strong>Service interruptions or downtime.</strong></li>
              </ul>
              <p>Our total liability is limited to the fees paid by you in the last 12 months.</p>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">9. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless OmniShare from any claims, damages, or costs arising from:</p>
              <ul className="list-disc pl-6">
                <li><strong>Your use of the Service in violation of these Terms.</strong></li>
                <li><strong>Your Content or data infringement claims.</strong></li>
                <li><strong>Your violation of applicable laws or third-party rights.</strong></li>
              </ul>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">10. Suspension & Termination</h2>
              <p className="mb-2">OmniShare may suspend or terminate your account if:</p>
              <ul className="list-disc pl-6 mb-2">
                <li><strong>Terms Violation:</strong> You violate these Terms of Service.</li>
                <li><strong>Illegal Activity:</strong> We suspect illegal activity or fraud.</li>
                <li><strong>Payment Issues:</strong> Payment is not received or declined.</li>
                <li><strong>Policy Violation:</strong> Your content violates OmniShare's policies or platform policies.</li>
              </ul>
              <p>Upon termination, your account and all associated data will be deleted within 30 days, unless required to retain by law.</p>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">11. Modifications to Terms</h2>
              <p>We may update these Terms at any time. Continued use of OmniShare after changes means you accept the updated Terms. We will notify you of major changes via email.</p>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">12. Governing Law</h2>
              <p>These Terms are governed by the laws of the <strong>United Arab Emirates</strong>. Any disputes shall be resolved in the courts of the UAE.</p>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">13. Contact Us</h2>
              <p className="mb-2">If you have questions or concerns about these Terms, please contact us:</p>
              <p>📧 support@omnishare.ai</p>
              <p>🌐 www.omnishare.ai</p>
              <p>📍 United Arab Emirates</p>
            </section>
            <hr className="my-4" />
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#7650e3]">14. Entire Agreement</h2>
              <p>These Terms of Service, along with our Privacy Policy, constitute the entire agreement between you and OmniShare. Any other agreements or representations are void.</p>
            </section>
      

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 font-medium text-sm">
            This Terms of Service is effective as of {new Date().toLocaleDateString()} and applies to all users of OmniShare.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
