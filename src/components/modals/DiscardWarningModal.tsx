// src/components/modals/DiscardWarningModal.tsx

import React, { FC } from 'react';

// Types for this specific modal
interface DiscardWarningModalProps {
  close: () => void;
  t: (key: string) => string;
  // onConfirmAction: Woh function jo 'Confirm' par chalega, jo yahan navigate("/content") hai.
  onConfirmAction: () => void; 
  // onBackAction: Woh function jo 'Back' button se aana chahiye tha, lekin aap usay pendingAction mein save kar rahe thay.
  // Hum isko directly is component mein pass nahi karenge, kyunke modal ke andar iska koi button nahi hai.
}

const DiscardWarningModal: FC<DiscardWarningModalProps> = ({ close, t, onConfirmAction }) => {
  return (
    <div 
      style={{
        position: 'fixed', 
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, 
      }}
      className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6" // Aapke styles
    >
      {/* Title aur Message aapke puraane code se */}
      <h2 className="text-2xl font-bold text-purple-700 mb-4 items-center flex justify-center">
        {t("discard_post_title")}
      </h2>
      <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
        {t("discard_post_warning")}
      </p>

      <div className="flex gap-3">
        {/* ❌ CANCEL Button */}
        <button
          onClick={() => {
            close(); // Modal band karein
          }}
          className="flex-1 bg-transparent border-purple-600 border text-purple-600 font-semibold py-2.5 rounded-md transition disabled:opacity-50"
        >
          {t("cancel")}
        </button>

        {/* ✅ CONFIRM Button */}
        <button
          onClick={() => {
            onConfirmAction(); // 👈 Woh action jo navigate("/content") kar raha tha
            close();           // Modal band karein
          }}
          className="flex-1 bg-purple-600 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-50"
        >
          {t("confirm")}
        </button>
      </div>
    </div>
  );
};

export default DiscardWarningModal;