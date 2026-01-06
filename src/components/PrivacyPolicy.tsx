import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Globe, MapPin } from "lucide-react";
import logoText from ".././assets/logo-text.svg"; // ✅ apne path ke hisaab se change

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ✅ Page Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="relative max-w-4xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Left: Back */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#7650e3] hover:text-[#6840c7] transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          {/* Center: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/dashboard" aria-label="Go to dashboard">
              <img src={logoText} alt="Logo" className="h-4" />
            </Link>
          </div>

          {/* Right spacer */}
          <div className="ml-auto w-[64px]" />
        </div>
      </header>

      {/* ✅ Page Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#7650e3] mb-2">
              Privacy Policy
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
            <p className="mb-4">
              Your privacy is important to us. This Privacy Policy explains how
              OmniShare ("we", "our", "us") collects, uses, stores, protects, and
              shares your information when you use our website, mobile app, and
              services (collectively, the "Service").
            </p>
            <p className="mb-4">
              By accessing or using OmniShare, you agree to the practices
              described in this Privacy Policy.
            </p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              1. Information We Collect
            </h2>

            <h3 className="font-semibold mb-1">1.1 Information You Provide to Us</h3>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong>Account details:</strong> Name, email address, phone
                number, and password
              </li>
              <li>
                <strong>Business information:</strong> Company name, profiles,
                brand data
              </li>
              <li>
                <strong>Content:</strong> Posts, captions, images, videos you
                upload or generate
              </li>
              <li>
                <strong>Payment details:</strong> Processed securely through
                third-party payment providers; we do not store full card
                information
              </li>
            </ul>

            <h3 className="font-semibold mb-1">1.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-2">
              <li>
                <strong>Device information</strong> (browser type, device model,
                OS)
              </li>
              <li>
                <strong>IP address and location</strong> (approximate)
              </li>
              <li>
                <strong>Usage data</strong> (pages visited, features used, time
                spent)
              </li>
              <li>
                <strong>Cookies and similar tracking technologies</strong>
              </li>
            </ul>

            <h3 className="font-semibold mb-1">1.3 Third-Party Integration Data</h3>
            <p>
              When you connect social profiles (Facebook, Instagram, TikTok,
              YouTube, LinkedIn), we may receive:
            </p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>Profile name and ID</strong></li>
              <li><strong>Permissions granted</strong></li>
              <li><strong>Publishing access</strong></li>
              <li><strong>Analytics and engagement metrics</strong></li>
            </ul>
            <p>We only access the data needed to provide our services.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              2. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mb-2">
              <li>Create and manage your account</li>
              <li>Provide AI-powered content creation</li>
              <li>Publish and schedule posts across platforms</li>
              <li>Improve media optimization and insights</li>
              <li>Show analytics and performance reports</li>
              <li>Communicate updates, alerts, or support messages</li>
              <li>Enhance platform performance and security</li>
              <li>Personalize your user experience</li>
              <li>Process subscription payments</li>
            </ul>
            <p>We do not sell your data to third parties.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              3. How We Share Your Information
            </h2>
            <p>We may share your data only with:</p>

            <h3 className="font-semibold mb-1">3.1 Service Providers</h3>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>Process payments</strong></li>
              <li><strong>Host the platform</strong></li>
              <li><strong>Provide analytics</strong></li>
              <li><strong>Deliver email notifications</strong></li>
            </ul>

            <h3 className="font-semibold mb-1">3.2 Social Media Platforms</h3>
            <p>
              Only when you authorize integration, and strictly as needed for
              posting and analytics.
            </p>

            <h3 className="font-semibold mb-1">3.3 Legal Requirements</h3>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>UAE laws</strong></li>
              <li><strong>Court orders</strong></li>
              <li><strong>Government or regulatory authorities</strong></li>
            </ul>
            <p>We never share your content unless legally required.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              4. Data Storage & Security
            </h2>
            <p>We use industry-standard encryption and security protocols to protect your data.</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>Data is stored</strong> securely on accredited servers</li>
              <li><strong>Access is limited</strong> to authorized personnel only</li>
              <li><strong>Regular security audits</strong> and monitoring are performed</li>
            </ul>
            <p>However, no system is 100% secure, and we cannot guarantee absolute protection.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              5. Your Rights & Choices
            </h2>
            <p>Depending on your jurisdiction, you may have rights such as:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request account or data deletion</li>
              <li><strong>Restriction:</strong> Limit data processing in certain cases</li>
              <li><strong>Unlink Accounts:</strong> Disconnect social media profiles anytime</li>
            </ul>
            <p>To exercise these rights, contact us at:</p>
            <p className="font-medium">support@omnishare.ai</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              6. Cookies & Tracking Technologies
            </h2>
            <p>We use cookies to:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>Improve performance</strong></li>
              <li><strong>Analyze user behavior</strong></li>
              <li><strong>Personalize content</strong></li>
              <li><strong>Remember preferences and login sessions</strong></li>
            </ul>
            <p>You may disable cookies through your browser settings, but some features may not function properly.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              7. Data Retention
            </h2>
            <p>We retain your information as long as:</p>
            <ul className="list-disc pl-6 mb-2">
              <li><strong>Your account is active,</strong> or</li>
              <li><strong>Needed to provide our services,</strong> or</li>
              <li><strong>Required by UAE law</strong></li>
            </ul>
            <p>After account deletion, some data may remain stored for legal or security purposes.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              8. Children's Privacy
            </h2>
            <p>OmniShare is not intended for individuals under 18 years.</p>
            <p>We do not knowingly collect data from minors.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              9. International Transfers
            </h2>
            <p>Your data may be stored or processed outside the UAE depending on server locations.</p>
            <p>We ensure all transfers follow industry-standard security and comply with applicable laws.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              10. Changes to This Privacy Policy
            </h2>
            <p>We may update this Privacy Policy from time to time.</p>
            <p>If major changes occur, we will notify you via email or platform alert.</p>
            <p>Continued use of OmniShare means you accept the updated terms.</p>
          </section>

          <hr className="my-4" />

          <section>
            <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
              11. Contact Us
            </h2>
            <p>If you have questions, concerns, or requests, contact us:</p>

            <ul className="mt-3 space-y-2">
              <li>
                <a href="mailto:support@omnishare.ai" className="text-[#7650e3] hover:underline">
                  <Mail className="w-4 h-4 inline mr-2" />
                  support@omnishare.ai
                </a>
              </li>
              <li>
                <a
                  href="https://www.omnishare.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  www.omnishare.ai
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=United+Arab+Emirates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7650e3] hover:underline"
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  United Arab Emirates
                </a>
              </li>
            </ul>
          </section>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              This privacy policy is effective as of {new Date().toLocaleDateString()} and applies to all users of OmniShare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
