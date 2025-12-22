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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-purple-600">
            Image Generator
          </h2>
          <button
            onClick={onClose}
            className="text-purple-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Image Preview */}
          {activeImage && (
            <div className="rounded-md overflow-hidden bg-gray-50 border border-gray-200">
              <img
                src={activeImage}
                alt="Generated preview"
                className="w-full h-[310px] object-contain"
              />
            </div>
          )}

          {/* Previous Generations */}
          {allGeneration.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Previous Generations
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allGeneration.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 flex-shrink-0 object-cover rounded cursor-pointer border-2 transition-all
                      ${
                        activeImage === img
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    alt={`Generation ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={modifyMode}
              onChange={handleModifyToggle}
              className="mt-0.5 h-4 w-4 text-blue-600 rounded"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Modify Selected Image
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Uncheck to generate a completely new image
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
              rows={3}
              placeholder={
                modifyMode
                  ? "Describe the changes you want to make..."
                  : "Describe the image you want to create..."
              }
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="rounded-md w-full flex items-center justify-between theme-bg-trinary theme-text-light border border-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] transition-colors duration-200 py-2 px-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? "Generating..." : modifyMode ? "Modify" : "Generate"}
              <div className="sm:inline-block rounded-md theme-bg-quaternary theme-text-secondary px-2 py-1">
                <Icon name="spiral-logo" size={16} />
                <span>{generationAmounts}</span>
              </div>
            </button>
            <button
              onClick={selectedFile ? onFileSave : confirmImage}
              disabled={isLoading || !activeImage}
              className=" px-6 rounded-md bg-purple-600/10 border border-purple-600 py-2  text-sm font-medium text-purple-600 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
