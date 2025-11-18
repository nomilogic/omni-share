import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "What is OmniShare?",
      answer:
        "OmniShare is an all-in-one social media management platform powered by advanced AI. It helps you create content, manage multiple channels, optimize media, analyze performance, and publish instantly — all from a single dashboard.",
    },
    {
      id: 2,
      question: "How does OmniShare's AI-powered content creation work?",
      answer:
        "Our AI analyzes your brand voice, industry trends, and platform requirements to generate high-quality posts, captions, descriptions, and hashtags. You get ready-to-publish content tailored for each social platform.",
    },
    {
      id: 3,
      question: "Which social media platforms does OmniShare support?",
      answer:
        "You can manage Facebook, Instagram, YouTube, LinkedIn, and TikTok — all through one centralized system.",
    },
    {
      id: 4,
      question: "Can I publish on multiple platforms at once?",
      answer:
        "Yes. With one click, OmniShare lets you publish your content across all connected platforms. The system also auto-generates AI text and images when needed.",
    },
    {
      id: 5,
      question: "Does OmniShare optimize media for each platform?",
      answer:
        "Absolutely. OmniShare automatically resizes your images and videos, creates YouTube thumbnails, and ensures every post meets the exact platform specifications.",
    },
    {
      id: 6,
      question: "What kind of insights does OmniShare provide?",
      answer:
        "You get clear, actionable analytics on engagement, reach, performance trends, and audience behavior — helping you make smarter decisions to improve your social strategy.",
    },
    {
      id: 7,
      question: "How fast is OmniShare's publishing system?",
      answer:
        "Our instant publishing engine ensures your posts go live immediately and reliably — so you can reach your audience at the perfect moment.",
    },
    {
      id: 8,
      question: "Can OmniShare help with trend-based content?",
      answer:
        "Yes! OmniShare scans real-time trends and transforms them into powerful captions, descriptions, and viral hashtags tailored to each platform.",
    },
    {
      id: 9,
      question: "Is OmniShare suitable for businesses and teams?",
      answer:
        "Definitely. OmniShare is built for individuals, agencies, brands, and teams managing content across different platforms, regions, or client accounts.",
    },
    {
      id: 10,
      question: "Do you offer demos or product walkthroughs?",
      answer:
        "Yes! You can explore the full potential of OmniShare with a personalized product demo to see how it can elevate your social growth.",
    },
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
            FAQ
          </h1>
          <p className="text-gray-500 font-medium">
            <strong>OmniShare</strong> – Social Media Management Suite
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
              <p className="mb-6 text-gray-700">
                Find answers to frequently asked questions about <strong>OmniShare</strong> and how our platform can help you manage your social media presence more effectively.
              </p>
            </section>

            {/* FAQ Items */}
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#7650e3] transition-colors"
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-left font-semibold text-gray-800 flex-1">
                      {item.id}. {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#7650e3] transition-transform flex-shrink-0 ml-4 ${
                        expandedId === item.id ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedId === item.id && (
                    <div className="px-6 py-4 bg-white border-t border-gray-200">
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
    

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 font-medium text-sm">
            Can't find what you're looking for? Contact our support team at support@omnishare.ai
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
