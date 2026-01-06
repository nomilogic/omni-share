// "use client";

// import React, { FC, useMemo, useState } from "react";
// import {
//   Copy,
//   X,
//   Facebook,
//   Twitter,
//   Linkedin,
//   Instagram,
//   Mail,
//   MessageCircle,
// } from "lucide-react";
// import { useTranslation } from "react-i18next";

// interface SharePopupModalProps {
//   close: () => void;
//   referralLink: string;
// }

// const SharePopupModal: FC<SharePopupModalProps> = ({ close, referralLink }) => {
//   const { t } = useTranslation();
//   const [copied, setCopied] = useState(false);

//   const shareText = useMemo(() => {
//     return `Join me on OmniShare! Use my referral link:`;
//   }, []);

//   const copyToClipboard = async (text: string) => {
//     await navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const openShareUrl = (url: string) => {
//     window.open(url, "_blank", "noopener,noreferrer");
//   };

//   const handleShare = (platform: string) => {
//     const u = encodeURIComponent(referralLink);
//     const txt = encodeURIComponent(shareText);

//     switch (platform) {
//       case "whatsapp":
//         openShareUrl(`https://wa.me/?text=${txt}%20${u}`);
//         break;
//       case "facebook":
//         openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${u}`);
//         break;
//       case "x":
//         openShareUrl(`https://twitter.com/intent/tweet?text=${txt}&url=${u}`);
//         break;
//       case "linkedin":
//         openShareUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`);
//         break;
//       case "instagram":
//         copyToClipboard(referralLink);
//         openShareUrl(`https://www.instagram.com/`);
//         break;
//       case "email":
//         openShareUrl(
//           `mailto:?subject=${encodeURIComponent(
//             "OmniShare Referral"
//           )}&body=${encodeURIComponent(`${shareText}\n\n${referralLink}`)}`
//         );
//         break;
//       case "copy":
//       default:
//         copyToClipboard(referralLink);
//         break;
//     }
//   };

//   // ✅ same positioning pattern as your AnalyticsModal
//   const modalPositioningStyles: React.CSSProperties = {
//     position: "fixed",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     zIndex: 1001,
//     maxWidth: "450px",
//     width: "100%",
//     padding: "0 16px",
//   };

//   return (
//     <div style={modalPositioningStyles} onClick={(e) => e.stopPropagation()}>
//       <div className="relative w-full bg-white rounded-xl shadow-lg border border-black/10 overflow-hidden">
//         {/* ✅ Upper close button (exact style you gave) */}
//         <button
//           onClick={close}
//           className="absolute right-3 top-3 w-6 h-6 z-10 rounded-full border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] md:bg-inherit transition-shadow border-[2px]"
//           aria-label="Close share dialog"
//         >
//           <X className="w-4 h-4 color-[#7650e3] stroke-[#7650e3] stroke-[3]" />
//         </button>

//         <div className="px-4 py-4 border-b">
//           <h3 className="text-base font-semibold text-slate-800">
//             {t("share") || "Share"}
//           </h3>
//           <p className="text-sm text-slate-600 mt-1">
//             {t("copy_link_share") || "Copy link / Share"}
//           </p>
//         </div>

//         <div className="p-4">
//           {/* Link row */}
//           <div className="flex items-center gap-2 w-full border border-purple-600 bg-white rounded-md overflow-hidden mb-3">
//             <input
//               type="text"
//               value={referralLink}
//               readOnly
//               className="px-3 py-2.5 w-full text-xs text-slate-700 font-mono outline-none"
//             />
//             <button
//               onClick={() => handleShare("copy")}
//               className="px-3 py-2.5 transition-colors"
//               title="Copy to clipboard"
//             >
//               <Copy className="w-4 h-4 text-[#7650e3]" />
//             </button>
//           </div>

//           {copied && (
//             <p className="text-xs text-green-600 mb-3">
//               {t("copied_to_clipboard") || "Copied to clipboard"}
//             </p>
//           )}

//           {/* ✅ Social buttons (icon color #7650e3 + hover style) */}
//           <div className="grid grid-cols-3 gap-3">
//             <button
//               onClick={() => handleShare("whatsapp")}
//               className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-white
//                          border-slate-200 hover:bg-[#d7d7fc] hover:border-[#7650e3] transition-colors"
//             >
//               <MessageCircle className="w-6 h-6 text-[#7650e3]" />
//               <span className="text-xs font-medium text-slate-800">WhatsApp</span>
//             </button>

//             <button
//               onClick={() => handleShare("facebook")}
//               className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-white
//                          border-slate-200 hover:bg-[#d7d7fc] hover:border-[#7650e3] transition-colors"
//             >
//               <Facebook className="w-6 h-6 text-[#7650e3]" />
//               <span className="text-xs font-medium text-slate-800">Facebook</span>
//             </button>

//             <button
//               onClick={() => handleShare("x")}
//               className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-white
//                          border-slate-200 hover:bg-[#d7d7fc] hover:border-[#7650e3] transition-colors"
//             >
//               <Twitter className="w-6 h-6 text-[#7650e3]" />
//               <span className="text-xs font-medium text-slate-800">X</span>
//             </button>

//             <button
//               onClick={() => handleShare("linkedin")}
//               className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-white
//                          border-slate-200 hover:bg-[#d7d7fc] hover:border-[#7650e3] transition-colors"
//             >
//               <Linkedin className="w-6 h-6 text-[#7650e3]" />
//               <span className="text-xs font-medium text-slate-800">LinkedIn</span>
//             </button>

//             <button
//               onClick={() => handleShare("instagram")}
//               className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-white
//                          border-slate-200 hover:bg-[#d7d7fc] hover:border-[#7650e3] transition-colors"
//             >
//               <Instagram className="w-6 h-6 text-[#7650e3]" />
//               <span className="text-xs font-medium text-slate-800">Instagram</span>
//             </button>

//             <button
//               onClick={() => handleShare("email")}
//               className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border bg-white
//                          border-slate-200 hover:bg-[#d7d7fc] hover:border-[#7650e3] transition-colors"
//             >
//               <Mail className="w-6 h-6 text-[#7650e3]" />
//               <span className="text-xs font-medium text-slate-800">Email</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SharePopupModal;
