import { Share2, Copy, Users } from "lucide-react";
import { useState } from "react";
import Referal from "../../assets/referal.png";
import { useAppContext } from "@/context/AppContext";
import { useTranslation } from "react-i18next";
function ReferralSection() {
  const [copied, setCopied] = useState(false);
  const { user } = useAppContext();
  const referralLink = `http://omnishare.ai/auth?referralId=${user.id}`;
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-100 rounded-md   px-5 py-4">
      <div className="grid md:grid-cols-3 gap-5  items-center">
        <div className="md:col-span-2 w-full">
          <h2 className="text-3xl font-bold text-[#7650e3] mb-1">
            {t("refer_earn")}
          </h2>
          <p className="text-black mb-5 text-sm font-medium leading-relaxed">
            {t("referral_bonus_message")}
          </p>

          <div className="mb-4">
            <label className="text-xs text-gray-500  mb-2 block font-medium">
              {t("copy_link_share")}
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
                {t("copied_to_clipboard")}
              </p>
            )}
          </div>

          <button className="flex items-center rounded-md gap-2 transition-colors text-md font-semibold text-white border-2 border-[#7650e3] bg-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] py-2 px-3 ">
            <Share2 className="w-[18px] h-[18px]" />
            {t("share")}
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
