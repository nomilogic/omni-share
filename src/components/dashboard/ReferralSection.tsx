import { Share2, Copy, Users } from "lucide-react";
import { useState } from "react";
import Referal from "../../assets/referal.png";
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
          <p className="text-black mb-5 text-sm font-medium leading-relaxed">
            When someone buys a package using your referral link, you both earn
            100 Buses Coins!
          </p>

          <div className="mb-4">
            <label className="text-xs text-slate-500 mb-2 block font-medium">
              Copy Link or Share Below
            </label>

            <div className="flex items-center gap-2 w-full border border-purple-600 bg-white rounded-md overflow-hidden">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="px-3 py-2.5 w-full text-xs text-slate-700 font-mono outline-none"
              />

              <button
                onClick={copyToClipboard}
                className="px-3 py-2.5  transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-purple-600" />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-2">
                Copied to clipboard!
              </p>
            )}
          </div>

          <button className="flex items-center rounded-md gap-2 transition-colors text-[13px] font-semibold bg-purple-600  text-white py-2.5 px-3">
            <Share2 className="w-[18px] h-[18px]" />
            Share
          </button>
        </div>

        <img
          src={Referal}
          className="w-full h-full object-cover object-center"
          alt=""
        />
      </div>
    </div>
  );
}

export default ReferralSection;
