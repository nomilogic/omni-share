import React from "react";
import {
  ArrowLeft,
  Mail,
  Globe,
  MapPin,
  Clock,
  MessageCircle,
  Phone,
  Lightbulb,
  Shield,
  BookOpen,
  Activity,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";



const Support: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-[#7650e3] mb-2">Support</h1>
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
            Welcome to <strong>OmniShare Support</strong>. We're here to help
            you get the most out of our platform. Whether you have questions,
            need technical assistance, or want to provide feedback, our support
            team is ready to assist you.
          </p>
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            1. Getting Started with Support
          </h2>
          <p className="mb-2">
            <strong>Multiple Support Channels:</strong> We offer support through
            email, live chat, and a comprehensive knowledge base to ensure you
            can reach us in the way that's most convenient for you.
          </p>
          <p>
            <strong>Response Time:</strong> Our support team aims to respond to
            all inquiries within 24 business hours. For urgent issues, please
            mark your request as "Priority."
          </p>
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            2. Frequently Asked Questions (FAQ)
          </h2>
          <p className="mb-2">Find answers to common questions about:</p>
          <ul className="list-disc pl-6 mb-2">
            <li>
              <strong>Account Setup:</strong> Creating and managing your
              OmniShare account
            </li>
            <li>
              <strong>Platform Integration:</strong> Connecting social media
              profiles (Facebook, Instagram, TikTok, YouTube, LinkedIn)
            </li>
            <li>
              <strong>Content Creation:</strong> Using AI-powered content
              generation features
            </li>
            <li>
              <strong>Scheduling & Publishing:</strong> Planning and scheduling
              posts across platforms
            </li>
            <li>
              <strong>Analytics & Reporting:</strong> Understanding performance
              metrics and analytics
            </li>
            <li>
              <strong>Subscription Management:</strong> Billing, upgrades, and
              cancellations
            </li>
          </ul>
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            3. Knowledge Base
          </h2>
          <p className="mb-2">Our comprehensive knowledge base includes:</p>
          <ul className="list-disc pl-6 mb-3">
            <li>
              <strong>Step-by-Step Guides:</strong> Detailed tutorials for every
              feature
            </li>
            <li>
              <strong>Video Tutorials:</strong> Visual walkthroughs of key
              functionalities
            </li>
            <li>
              <strong>Best Practices:</strong> Tips and strategies for
              maximizing your social media presence
            </li>
            <li>
              <strong>Troubleshooting:</strong> Solutions for common issues and
              errors
            </li>
          </ul>
          
        </section>
        <hr className="my-4" />
        <section>
  <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
    4. Contact Support
  </h2>
  <p className="mb-2">
    Reach out to our support team through any of these channels:
  </p>
  <ul className="space-y-2">
    <li>
      <Mail className="w-4 h-4 inline mr-2 text-[#7650e3]" />
      <strong className="text-black">Email:</strong>{" "}
      <a
        href="mailto:support@omnishare.ai"
        className="text-[#7650e3] hover:underline"
      >
        support@omnishare.ai
      </a>
    </li>
    <li>
      <MessageCircle className="w-4 h-4 inline mr-2 text-[#7650e3]" />
      <strong className="text-black">Live Chat:</strong>{" "}
      <span className="text-gray-700">Available on our website (9 AM - 6 PM UAE time)</span>
    </li>
    
    
  </ul>
</section>

        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            5. Common Issues & Solutions
          </h2>
          <h3 className="font-semibold mb-2">5.1 Account & Login Issues</h3>
          <ul className="list-disc pl-6 mb-2">
            <li>
              <strong>Forgot Password:</strong> Use the "Forgot Password" link
              on the login page to reset your password.
            </li>
            <li>
              <strong>Account Locked:</strong> If your account is locked after
              multiple failed login attempts, contact support.
            </li>
            <li>
              <strong>Two-Factor Authentication:</strong> Ensure you're using
              the correct code generated by your authenticator app.
            </li>
          </ul>
          <h3 className="font-semibold mb-2">5.2 Social Media Integration</h3>
          <ul className="list-disc pl-6 mb-2">
            <li>
              <strong>Connection Failed:</strong> Ensure you have admin access
              to the social profile and re-authorize OmniShare.
            </li>
            <li>
              <strong>Posts Not Publishing:</strong> Check that the content
              complies with platform guidelines and permissions are granted.
            </li>
            <li>
              <strong>Analytics Not Loading:</strong> Wait 24 hours for data to
              sync from the social platform.
            </li>
          </ul>
          <h3 className="font-semibold mb-2">5.3 Content & Scheduling</h3>
          <ul className="list-disc pl-6 mb-2">
            <li>
              <strong>AI Generation Issues:</strong> Ensure your prompt is clear
              and relevant to your brand.
            </li>
            <li>
              <strong>Scheduled Posts Not Published:</strong> Verify that your
              account has sufficient posting permissions on the platform.
            </li>
            <li>
              <strong>Media Upload Errors:</strong> Check file size and format
              (JPG, PNG, MP4 supported).
            </li>
          </ul>
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            6. Billing & Subscription Support
          </h2>
          <p className="mb-2">
            Questions about your subscription? We can help with:
          </p>
          <ul className="list-disc pl-6 mb-2">
            <li>
              <strong>Upgrade/Downgrade Plans:</strong> Change your subscription
              tier anytime from account settings.
            </li>
            <li>
              <strong>Billing Issues:</strong> If you're experiencing payment
              problems, contact our billing team.
            </li>
            <li>
              <strong>Refunds & Credits:</strong> Policy information and refund
              requests can be submitted through support.
            </li>
            <li>
              <strong>Invoice & Receipts:</strong> Download your invoices from
              the "Billing" section of your account.
            </li>
          </ul>
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            7. Feature Requests & Feedback
          </h2>
          <p>
            Send your suggestions to:{" "}
            <a
              href="mailto:feedback@omnishare.ai"
              className="text-[#7650e3] hover:underline"
            >
              <Lightbulb className="w-4 h-4 inline mr-2" />
              feedback@omnishare.ai
            </a>
          </p>
          <ul className="list-disc pl-6 mb-2">
            <li>
              <strong>Submitting Feature Requests:</strong> Tell us what
              features you'd like to see.
            </li>
            <li>
              <strong>Reporting Bugs:</strong> Report any technical issues you
              encounter.
            </li>
            <li>
              <strong>Sharing Feedback:</strong> Let us know what you think
              about your experience with OmniShare.
            </li>
          </ul>
          <p>Send your suggestions to: 💡 feedback@omnishare.ai</p>
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            8. Security & Privacy Support
          </h2>
          <p className="mb-2">
            Security and privacy are our top priorities. If you have concerns:
          </p>
          <ul className="list-disc pl-6 mb-2">
            <li>
              <strong>Data Protection:</strong> Learn how we protect your data
              in our Privacy Policy.
            </li>
            <li>
              <strong>Account Security:</strong> Enable two-factor
              authentication for added protection.
            </li>
            <li>
              <strong>Report Security Issues:</strong>{" "}
              <a
                href="mailto:security@omnishare.ai"
                className="text-[#7650e3] hover:underline"
              >
                security@omnishare.ai
              </a>
            </li>
          </ul>
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            9. Training & Webinars
          </h2>
          <p className="mb-2">
            Enhance your skills with our training resources:
          </p>
          <ul className="list-disc pl-6 mb-2">
            <li>
              <strong>Live Webinars:</strong> Weekly sessions on platform
              features and best practices
            </li>
            <li>
              <strong>On-Demand Videos:</strong> Access recorded training
              sessions anytime
            </li>
            <li>
              <strong>Certification Program:</strong> Become an OmniShare
              certified user
            </li>
          </ul>
          
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            10. System Status & Maintenance
          </h2>
          <p className="mb-2">Stay informed about platform status:</p>
          <ul className="list-disc pl-6 mb-2">
            
            <li>
              <strong>Maintenance Alerts:</strong> Scheduled maintenance
              notifications are sent via email
            </li>
            <li>
              <strong>Incident Reports:</strong> Detailed information about
              service disruptions and resolutions
            </li>
          </ul>
        </section>
        <hr className="my-4" />
        <section>
          <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
            11. Community & User Groups
          </h2>
          <p className="mb-2">Connect with other OmniShare users:</p>
          <ul className="list-disc pl-6 mb-2">
            
            <li>
  <strong className="text-black">Social Media Groups:</strong>{" "}
  <span className="text-gray-700">Follow us on </span>
  <a
    href="https://www.linkedin.com/company/omnishare-ai"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#7650e3] hover:underline"
  >
    LinkedIn
  </a>
  <span className="text-gray-700">, </span>
  <a
    href="https://www.facebook.com/share/1H74CpLTCK/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#7650e3] hover:underline"
  >
    Facebook
  </a>
  <span className="text-gray-700">, and </span>
  <a
    href="https://www.instagram.com/omnishare.ai/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[#7650e3] hover:underline"
  >
    Instagram
  </a>
  <span className="text-gray-700"> for updates and tips</span>
</li>

            <li>
              <strong>User Events:</strong> Attend our annual OmniShare Summit
              and local meetups
            </li>
          </ul>
        </section>
        <hr className="my-4" />
        <section>
  <h2 className="text-xl font-bold mb-2 text-[#7650e3]">
    12. Contact Information
  </h2>
  <p className="mb-3">
    Get in touch with us using any of these methods:
  </p>
  <ul className="space-y-2">
    <li>
      <Mail className="w-4 h-4 inline mr-2 text-[#7650e3]" />
      <strong className="text-black">Email:</strong>{" "}
      <a
        href="mailto:support@omnishare.ai"
        className="text-[#7650e3] hover:underline"
      >
        support@omnishare.ai
      </a>
    </li>
    <li>
      <Globe className="w-4 h-4 inline mr-2 text-[#7650e3]" />
      <strong className="text-black">Website:</strong>{" "}
      <a
        href="https://www.omnishare.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7650e3] hover:underline"
      >
        www.omnishare.ai
      </a>
    </li>
    <li>
      <MessageCircle className="w-4 h-4 inline mr-2 text-[#7650e3]" />
      <strong className="text-black">Live Chat:</strong>{" "}
      <span className="text-gray-700">Available on our website</span>
    </li>
    <li>
      <MapPin className="w-4 h-4 inline mr-2 text-[#7650e3]" />
      <strong className="text-black">Location:</strong>{" "}
      <a
        href="https://maps.google.com/?q=United+Arab+Emirates"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7650e3] hover:underline"
      >
        United Arab Emirates
      </a>
    </li>
    <li>
      <Clock className="w-4 h-4 inline mr-2 text-[#7650e3]" />
      <strong className="text-black">Business Hours:</strong>{" "}
      <span className="text-gray-700">9 AM - 6 PM (Sunday to Thursday, UAE Time)</span>
    </li>
  </ul>
</section>


        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 font-medium text-sm">
            This Support page is effective as of{" "}
            {new Date().toLocaleDateString()} and applies to all users of
            OmniShare.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
