import { useDiscardModals } from "./DiscardModalContext";
import { useTranslation } from "react-i18next";

export default function GlobalDiscardModals() {
  const t = useTranslation()[0];

  const {
    discardImageOpen,
    discardImageAction,
    closeDiscardImage,

    discardPostOpen,
    discardPostAction,
    closeDiscardPost,

    discardPostWarningOpen,
    discardPostWarningAction,
    closeDiscardPostWarning,
  } = useDiscardModals();

  return (
    <>
      {/* ---------------- Modal 1 ---------------- */}
      {discardImageOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 items-center flex justify-center">
              {t("discard_image_title")}
            </h2>

            <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
              {t("discard_image_message")}
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDiscardImage}
                className="flex-1 bg-transparent border-purple-600 border text-purple-600 flex items-center gap-2 justify-center hover:bg-[#d7d7fc] hover:text-[#7650e3]"
              >
                {t("cancel")}
              </button>

              <button
                onClick={() => {
                  discardImageAction?.();
                  closeDiscardImage();
                }}
                className="flex-1 bg-purple-600 text-white"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Modal 2 ---------------- */}
      {discardPostOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 items-center flex justify-center">
              {t("discard_post_title")}
            </h2>

            <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
              {t("discard_post_message")}
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDiscardPost}
                className="flex-1 bg-transparent border-purple-600 border text-purple-600"
              >
                {t("cancel")}
              </button>

              <button
                onClick={() => {
                  discardPostAction?.();
                  closeDiscardPost();
                }}
                className="flex-1 bg-purple-600 text-white"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Modal 3 ---------------- */}
      {discardPostWarningOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]">
          <div className="bg-gray-50 rounded-md shadow-md w-full max-w-md px-8 py-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 items-center flex justify-center">
              {t("discard_post_title")}
            </h2>

            <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed">
              {t("discard_post_warning")}
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDiscardPostWarning}
                className="flex-1 bg-transparent border-purple-600 border text-purple-600"
              >
                {t("cancel")}
              </button>

              <button
                onClick={() => {
                  discardPostWarningAction?.();
                  closeDiscardPostWarning();
                }}
                className="flex-1 bg-purple-600 text-white"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
