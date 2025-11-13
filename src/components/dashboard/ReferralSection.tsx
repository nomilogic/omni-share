import { Share2, Copy, Users } from "lucide-react";
import { useState } from "react";

function ReferralSection() {
  const [copied, setCopied] = useState(false);
  const referralLink =
    "https://omnishare.ai/auth?referralId=25803be2-d178-48e9-8631-d73b042f6dee";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-100 rounded-2xl   px-5 py-4">
      <div className="grid md:grid-cols-3 gap-5  items-center">
        <div className="col-span-2 w-full">
          <h2 className="text-3xl font-bold text-[#7650e3] mb-1">
            Refer & Earn!
          </h2>
          <p className="text-gray-700 mb-5 text-sm leading-relaxed">
            When someone buys a package using your referral link, you both earn
            100 Buses Coins!
          </p>

          <div className="mb-6">
            <label className="text-xs text-gray-600 mb-2 block font-medium">
              Copy Link or Share Below
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-xs text-gray-600 bg-stone-50 font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-2">
                Copied to clipboard!
              </p>
            )}
          </div>

          <button
            className="flex items-center gap-2 text-white px-6 py-2.5 rounded-md font-bold text-sm transition-colors"
            style={{
              backgroundColor: "#7650e3",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#d7d7fc";
              e.currentTarget.style.color = "#7650e3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#7650e3";
              e.currentTarget.style.color = "white";
            }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <div className="flex justify-center w-full">
          <div className="relative w-full h-56 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl"></div>

            {/* People/Network visualization */}
            <div className="relative flex items-center justify-center gap-0"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferralSection;
