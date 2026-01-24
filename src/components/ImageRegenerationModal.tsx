import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "./Icon";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useNavigationGuard } from "../hooks/useNavigationGuard";

export default function ImageRegenerationModal({
  imageUrl,
  onClose,
  onRegenerate,
  isLoading,
  confirmImage,
  selectedFile,
  onFileSave,
  allGeneration = [],
  modifyMode,
  setModify,
  generationAmounts,
  useLogo,
  setUseLogo,
  useTheme,
  setUseTheme,
  logoUrl,
  themeUrl,
  prompt,
  setPrompt,
}: any) {
  const [activeImage, setActiveImage] = useState(imageUrl);
  const { t } = useTranslation();
  const { showConfirm, closeConfirm } = useConfirmDialog();

  // Check if there's active regeneration or unsaved changes
  const hasActiveOperation = () => {
    return (
      isLoading ||
      (prompt && prompt.trim().length > 0) ||
      allGeneration?.length > 0
    );
  };

  // Guard navigation when there are unsaved changes or regeneration in progress
  useNavigationGuard({
    isActive: hasActiveOperation(),
    title: t("confirm_navigation") || "Confirm Navigation",
    message: isLoading
      ? t("image_regeneration_in_progress") ||
        "Image regeneration in progress. Are you sure you want to leave?"
      : t("unsaved_changes_warning") ||
        "You have unsaved changes. Are you sure you want to leave?",
  });

  // Intercept all navigation attempts (including link clicks and React Router links)
  useEffect(() => {
    const handleClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check for both regular links and React Router Link components
      const link = target.closest("a") as HTMLAnchorElement;

      if (link) {
        // Only intercept internal links (not external URLs and not downloads)
        const href = link.getAttribute("href");
        if (href && !href.includes("://") && !link.download) {
          if (hasActiveOperation()) {
            e.preventDefault();
            e.stopPropagation();
            showConfirm(
              t("confirm_navigation") || "Confirm",
              isLoading
                ? t("image_regeneration_in_progress") ||
                    "Image regeneration in progress. Are you sure you want to leave?"
                : t("unsaved_changes_warning") ||
                    "You have unsaved changes. Are you sure you want to leave?",
              () => {
                closeConfirm();
                onClose();
              }
            );
          }
        }
      }
    };

    // Use capture phase to intercept before default behavior
    document.addEventListener("click", handleClickCapture, true);
    return () => {
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [hasActiveOperation, isLoading, showConfirm, closeConfirm, t]);

  useEffect(() => {
    if (imageUrl) setActiveImage(imageUrl);
  }, [imageUrl]);

  const handleModifyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModify(e.target.checked);
  };

  // Convert blob URL to base64
  const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting blob URL to base64:", error);
      return blobUrl;
    }
  };

  const isBlobUrl = (url: string): boolean => {
    return url?.startsWith("blob:");
  };

  const handleSubmit = async () => {
    if (!prompt?.trim()) return;

    let payload = null;
    if (modifyMode && activeImage) {
      // Convert blob URL to base64 if needed
      if (isBlobUrl(activeImage)) {
        payload = await blobUrlToBase64(activeImage);
      } else {
        payload = activeImage;
      }
    }

    // Pass just prompt and payload - checkboxes are already bound to parent state
    onRegenerate(prompt, payload);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0 bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {t("image_generator")}
              </h2>
              <p className="text-xs text-gray-500">
                {modifyMode
                  ? t("modify_selected_image")
                  : t("generate_new_image")}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (hasActiveOperation()) {
                const message = isLoading
                  ? t("image_regeneration_in_progress") ||
                    "Image regeneration in progress. Are you sure you want to leave?"
                  : t("unsaved_changes_warning") ||
                    "You have unsaved changes. Are you sure you want to leave?";

                showConfirm(
                  t("confirm_navigation") || "Confirm Navigation",
                  message,
                  () => {
                    closeConfirm();
                    onClose();
                  }
                );
              } else {
                onClose();
              }
            }}
            className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition"
            aria-label={t("close")}
            title={t("close")}
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] grid-rows-[65%_35%] lg:grid-rows-1">
            {/* Left: Preview (NO SCROLL) */}
            <div className="min-h-0 overflow-hidden p-4 sm:p-6 flex flex-col h-full">
              <div className="flex-1 min-h-0 rounded-md border border-gray-200 bg-gray-50 overflow-hidden shadow-sm relative">
                {activeImage ? (
                  <>
                    {/* Image area (reserve space for the mobile thumbnails overlay) */}
                    <div className="h-full w-full flex items-center justify-center p-3 sm:p-4 pb-16 lg:pb-4">
                      <img
                        src={activeImage}
                        alt="Generated preview"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Previous Generations: MOBILE ONLY, inside preview at bottom */}
                    {allGeneration.length > 0 && (
                      <div className="block sm:hidden absolute left-0 right-0 bottom-0 border-t border-gray-200 bg-white/85 backdrop-blur px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-900">
                            {t("images")}
                          </p>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {allGeneration.map((img: string, index: number) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setActiveImage(img)}
                              className="group relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden border"
                              aria-label={`Select generation ${index + 1}`}
                              title={`Generation ${index + 1}`}
                            >
                              <img
                                src={img}
                                className="h-full w-full object-cover"
                                alt={`Generation ${index + 1}`}
                              />
                              <span
                                className={`absolute inset-0 ring-2 transition
                      ${
                        activeImage === img
                          ? "ring-blue-500"
                          : "ring-transparent group-hover:ring-blue-300"
                      }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
                    <div className="h-12 w-12 rounded-md bg-purple-600/10 flex items-center justify-center mb-3">
                      <span className="text-purple-700 text-xl">🖼️</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {t("no_image_selected_yet")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("generate_image_or_select_previous")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Controls (scroll allowed here) */}
            <div className="min-h-0 h-full overflow-auto border-t lg:border-t-0 lg:border-l border-gray-200 bg-white p-4 sm:p-6">
              {/* Previous Generations (moved BELOW status) */}
              {allGeneration.length > 0 && (
                <div className=" hidden sm:block rounded-md border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {t("images")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("tap_to_preview")}
                    </p>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allGeneration.map((img: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className="group relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border"
                        aria-label={`Select generation ${index + 1}`}
                        title={`Generation ${index + 1}`}
                      >
                        <img
                          src={img}
                          className="h-full w-full object-cover"
                          alt={`Generation ${index + 1}`}
                        />
                        <span
                          className={`absolute inset-0 ring-2 transition
                          ${
                            activeImage === img
                              ? "ring-blue-500"
                              : "ring-transparent group-hover:ring-blue-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-5 pt-4">
                {/* Mode Selection */}
                <label className="flex items-start gap-3 cursor-pointer rounded-md border border-gray-200 p-4 hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={modifyMode}
                    onChange={handleModifyToggle}
                    className="mt-1 h-4 w-4 text-blue-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t("modify_selected_image_label")}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("uncheck_to_generate_new")}
                    </p>
                  </div>
                </label>

                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {t("prompt")}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={5}
                    placeholder={
                      modifyMode
                        ? t("describe_changes_to_make")
                        : t("describe_image_to_create")
                    }
                    className="w-full resize-none rounded-md border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{t("be_specific_prompt_tip")}</span>
                    <span>{prompt?.length ?? 0}</span>
                  </div>

                  {/* Use for Generation Section */}
                </div>

                {/* Desktop actions */}
                <div className="hidden sm:flex gap-3 pt-1 justify-between">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt?.trim()}
                    className="group w-full rounded-md  hover:bg-[#d7d7fc] border border-purple-600 flex items-center justify-between text-base font-semibold  text-[#7650e3] transition-colors duration-200 py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-md"
                  >
                    {isLoading
                      ? t("generating")
                      : modifyMode
                        ? t("modify")
                        : t("regenerate")}

                    <div className="px-2.5  flex items-center gap-2">
                      <Icon name="spiral-logo" size={20} />
                      <span>{generationAmounts}</span>
                    </div>
                  </button>

                  <button
                    onClick={selectedFile ? onFileSave : confirmImage}
                    disabled={isLoading || !activeImage}
                    className="px-4 rounded-md w-full text-base font-semibold  py-2.5  text-purple-700 border border-[#7650e3] theme-bg-trinary theme-text-light hover:bg-[#d7d7fc] hover:text-[#7650e3]  disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("continue")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom action bar */}
        <div className="sm:hidden fixed md:static bottom-0 left-0 right-0  bg-white p-3 ">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt?.trim()}
              className=" group w-full py-2.5 rounded-md border font-semibold border-purple-600 hover:bg-gray-50 transition  flex items-center justify-between   text-[#7650e3]  duration-200  px-3 disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {isLoading
                ? t("generating")
                : modifyMode
                  ? t("modify")
                  : t("regenerate")}
              <div className="px-2.5  flex items-center gap-2">
                <Icon name="spiral-logo" size={16} />
                <span>{generationAmounts}</span>
              </div>
            </button>

            <button
              onClick={selectedFile ? onFileSave : confirmImage}
              disabled={isLoading || !activeImage}
              className=" rounded-md w-full text-base px-3 bg-purple-600/10  py-2.5 font-semibold text-purple-700 hover:border-gray-400  border border-[#7650e3] theme-bg-trinary theme-text-light hover:bg-[#d7d7fc] hover:text-[#7650e3] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("continue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
