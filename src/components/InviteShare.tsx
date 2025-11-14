import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Copy, Share2, X } from "lucide-react";

type InviteOpts = {
  title?: string;
  description?: string;
};

const InviteModal: React.FC<{
  link: string;
  opts?: InviteOpts;
  onClose: () => void;
}> = ({ link, opts, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("copy failed", err);
    }
  };

  const share = async () => {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: opts?.title || "Invite",
          text: opts?.description || "Join me on OmniShare",
          url: link,
        });
      } catch (err) {
        console.error("share failed", err);
      }
    } else {
      // fallback to copy
      copy();
      alert(
        "Share API not supported in this browser — link copied to clipboard"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-md shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {opts?.title || "Invite a friend"}
            </h3>
            <p className="text-sm text-slate-500">
              {opts?.description || "Share this link to invite others"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-slate-500 mb-2">
            Invite link
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 px-3 py-2.5 border rounded bg-gray-50"
            />
            <button
              onClick={copy}
              title="Copy link"
              className="px-2 py-2.5 bg-gray-100 rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <div className="text-xs text-green-600 mt-2">Copied!</div>}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={share}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// programmatic opener
export function openInviteModal(link: string, opts?: InviteOpts) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  function cleanup() {
    setTimeout(() => {
      try {
        root.unmount();
        container.remove();
      } catch (e) {
        console.error(e);
      }
    }, 200);
  }

  root.render(<InviteModal link={link} opts={opts} onClose={cleanup} />);
}

export default InviteModal;
