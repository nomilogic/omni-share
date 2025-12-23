import { useEffect, useState } from "react";
import Icon from "./Icon";

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
}: any) {
  const [prompt, setPrompt] = useState("");
  const [activeImage, setActiveImage] = useState(imageUrl);

  useEffect(() => {
    if (imageUrl) setActiveImage(imageUrl);
  }, [imageUrl]);

  const handleModifyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModify(e.target.checked);
  };

  const handleSubmit = () => {
    if (!prompt?.trim()) return;
    let payload = modifyMode ? activeImage : null;
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
            <div className="h-9 w-9 rounded-lg bg-purple-600/10 flex items-center justify-center">
              <span className="text-purple-700 font-semibold">✨</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Image Generator
              </h2>
              <p className="text-xs text-gray-500">
                {modifyMode
                  ? "Modify the selected image"
                  : "Generate a new image"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition"
            aria-label="Close"
            title="Close"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] grid-rows-[65%_35%] lg:grid-rows-1">
            {/* Left: Preview (NO SCROLL) */}
            <div className="min-h-0 overflow-hidden p-4 sm:p-6 flex flex-col h-full">
              <div className="flex-1 min-h-0 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm relative">
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
                            Previous
                          </p>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {allGeneration.map((img: string, index: number) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setActiveImage(img)}
                              className="group relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border"
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
                    <div className="h-12 w-12 rounded-2xl bg-purple-600/10 flex items-center justify-center mb-3">
                      <span className="text-purple-700 text-xl">🖼️</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      No image selected yet
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Generate an image or select one from previous generations.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Controls (scroll allowed here) */}
            <div className="min-h-0 h-full overflow-auto border-t lg:border-t-0 lg:border-l border-gray-200 bg-white p-4 sm:p-6">
              {/* Previous Generations (moved BELOW status) */}
              {allGeneration.length > 0 && (
                <div className=" hidden sm:block rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      Previous Generations
                    </p>
                    <p className="text-xs text-gray-500">Tap to preview</p>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allGeneration.map((img: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className="group relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border"
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
                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={modifyMode}
                    onChange={handleModifyToggle}
                    className="mt-1 h-4 w-4 text-blue-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Modify Selected Image
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Uncheck to generate a completely new image.
                    </p>
                  </div>
                </label>

                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={5}
                    placeholder={
                      modifyMode
                        ? "Describe the changes you want to make..."
                        : "Describe the image you want to create..."
                    }
                    className="w-full resize-none rounded-xl border border-gray-300 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Tip: Be specific (style, lighting, background, etc.)
                    </span>
                    <span>{prompt?.length ?? 0}</span>
                  </div>
                </div>

                {/* Desktop actions */}
                <div className="hidden sm:flex gap-3 pt-1">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt.trim()}
                    className="group w-full rounded-xl flex items-center justify-between border border-[#7650e3] theme-bg-trinary theme-text-light hover:bg-[#d7d7fc] hover:text-[#7650e3] transition-colors duration-200 py-3 px-4 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading
                      ? "Generating..."
                      : modifyMode
                      ? "Modify"
                      : "Generate"}

                    <div className="px-2.5 py-1.5 flex items-center gap-2">
                      <Icon
                        name="spiral-logo"
                        size={16}
                        className="brightness-[1000%] transition group-hover:brightness-100"
                      />
                      <span>{generationAmounts}</span>
                    </div>
                  </button>

                  <button
                    onClick={selectedFile ? onFileSave : confirmImage}
                    disabled={isLoading || !activeImage}
                    className="px-6 rounded-xl bg-purple-600/10 border border-purple-600 py-3 text-sm font-medium text-purple-700  disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>

                {/* Helpful status
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {isLoading
                      ? "Working on it…"
                      : activeImage
                      ? "Ready."
                      : "Generate an image to begin."}
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom action bar */}
        <div className="sm:hidden sticky bottom-0 z-10 border-t border-gray-200 bg-white/90 backdrop-blur px-4 py-3">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className=" group w-full rounded-xl flex items-center justify-between border border-[#7650e3] theme-bg-trinary theme-text-light hover:bg-[#d7d7fc] hover:text-[#7650e3] transition-colors duration-200 py-3 px-4 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Generating..." : modifyMode ? "Modify" : "Generate"}
              <div className="px-2.5 py-1.5 flex items-center gap-2">
                      <Icon
                        name="spiral-logo"
                        size={16}
                        className="brightness-[1000%] transition group-hover:brightness-100"
                      />
                <span>{generationAmounts}</span>
              </div>
            </button>

            <button
              onClick={selectedFile ? onFileSave : confirmImage}
              disabled={isLoading || !activeImage}
              className="px-5 rounded-xl bg-purple-600/10 border border-purple-600 py-3 text-sm font-medium text-purple-700 hover:border-gray-400 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
