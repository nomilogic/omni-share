import React, { FC } from 'react';

// TS Types for this specific modal
interface DiscardPostModalProps {
  // 1. close function jo useModal hook se aayega
  close: () => void; 
  // 2. navigate function ya required action jo aapko component se chahiye
  onConfirm: () => void; 
  // 3. Translation function ya strings
  t: (key: string) => string; 
}

const DiscardPostModal: FC<DiscardPostModalProps> = ({ close, onConfirm, t }) => {
  // **Zaroori Styling Note:** Humne backdrop aur positioning ModalContext.tsx mein handle ki hai.
  // Lekin aapke andar wale modal ki z-index backdrop (1000) se zyada honi chahiye (1001)

  return (
    <div 
      // Yeh div modal ki body hai
      style={{
        position: 'fixed', // Portal hone ke bawajood fixed position zaroori hai
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, // Backdrop (1000) se zyada
      }}
      className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6" // Tailwind styles
    >
      {/* Aapka title aur message */}
      <h2 className="text-2xl font-bold text-purple-700 mb-4 items-center flex justify-center">
        {t("discard_post_title")}
      </h2>
      <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
        {t("discard_post_message")}
      </p>

      <div className="flex gap-3">
        {/* Cancel Button */}
        <button
          onClick={() => {
            close(); // Simply call the close function from props
            // setPendingDiscardAction(null) ki zaroorat nahi, state is component mein nahi hai
          }}
          className="flex-1 bg-transparent hover:bg-[#d7d7fc] border-purple-600 border text-purple-600 font-semibold py-2.5 rounded-md transition disabled:opacity-50"
        >
          {t("cancel")}
        </button>

        {/* Confirm Button */}
        <button
          onClick={() => {
            onConfirm(); // Perform the actual navigation
            close();     // Close the modal
          }}
          className="flex-1 bg-purple-600 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-50 hover:bg-[#d7d7fc] hover:text-[#7650e3] border border-purple-600"
        >
          {t("confirm")}
        </button>
      </div>
    </div>
  );
};

export default DiscardPostModal;