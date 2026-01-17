// src/components/modals/DiscardImageModal.tsx

import React, { FC } from 'react';

// Types define karein
interface DiscardImageModalProps {
  close: () => void;
  t: (key: string) => string;
  // onConfirmAction: Woh function jo Confirm button par chalna chahiye (jo ke onCancel() hai)
  onConfirmAction: () => void; 
}

const DiscardImageModal: FC<DiscardImageModalProps> = ({ close, t, onConfirmAction }) => {
  return (
    <div 
      style={{
        position: 'fixed', 
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, 
      }}
      className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6"
    >
      {/* Title aur Message */}
      <h2 className="text-2xl font-bold text-purple-700 mb-4 items-center flex justify-center">
        {t("discard_image_title")}
      </h2>
      <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
        {t("discard_image_message")}
      </p>

      <div className="flex gap-3">
        {/* ❌ CANCEL Button */}
        <button
          onClick={() => {
            close(); // Modal band karein
          }}
          className="flex-1 theme-bg-light text-base border border-[#7650e3] text-[#7650e3] transition-colors hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3] disabled:cursor-not-allowed font-semibold py-2.5 rounded-md "
        >
          {t("cancel")}
        </button>

        {/* ✅ CONFIRM Button */}
        <button
          onClick={() => {
            onConfirmAction(); // 👈 onCancel() function chalao
            close();           // Modal band karo
          }}
          className="flex-1 rounded-md bg-purple-600 text-white hover:text-[#7650e3] hover:bg-[#d7d7fc] border border-[#7650e3] "
        >
          {t("confirm")}
        </button>
      </div>
    </div>
  );
};

export default DiscardImageModal;