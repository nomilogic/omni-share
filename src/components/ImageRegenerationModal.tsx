import { useState } from "react";

export default function ImageRegenerationModal({
  imageUrl,
  onClose,
  onRegenerate,
  isLoading,
  confirmImage,
  selectedFile,
  onFileSave,
}: any) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onRegenerate(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity/60">
      <div className="relative w-full max-w-2xl px-6 py-4 space-y-4 overflow-hidden rounded-md bg-white shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between border-b  py-3           text-purple-600
          
          "
        >
          <h2 className="text-xl font-semibold ">Generated Image</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Image Preview */}
        <div className="flex items-center justify-center bg-gray-50 ">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated"
              className="max-h-[360px] w-full rounded-md object-cover"
            />
          ) : (
            <div className="text-sm text-gray-400">No image available</div>
          )}
        </div>

        {/* Regenerate Input */}
        <div className="border-t pt-4 ">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter new prompt to regenerate image..."
            className="w-full resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows={3}
          />
          <div className="flex gap-5">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-3 w-full rounded-md bg-purple-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {isLoading ? "Regenerating..." : "Regenerate Image"}
            </button>
            <button
              onClick={selectedFile ? onFileSave : confirmImage}
              disabled={isLoading}
              className="mt-3 w-full rounded-md bg-purple-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {"Save Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
