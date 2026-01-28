import { FC } from "react";
import { motion } from "framer-motion";
import IntroVideo from "../../assets/Omnishare Tutorial.Final.00.mp4";
import VideoPoster from "../../assets/omnishare-02 (6).jpg";

interface VideoModalProps {
  close: () => void;
}

const VideoModal: FC<VideoModalProps> = ({ close }) => {
  return (
    <div onClick={close} className="fixed inset-0 flex items-center justify-center p-3 md:p-6">
      {/* backdrop optional */}
      {/* <div className="absolute inset-0 bg-black/40" onClick={close} /> */}

      <div  className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-md shadow-md backdrop-blur-md bg-white/70">
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-2 right-2 z-10 text-gray-700 hover:text-black"
        >
          ✕
        </button>

        {/* Video */}
        <motion.video
          src={IntroVideo}
          muted
          loop
          playsInline
          controls
          preload="none"
          poster={VideoPoster}
          className="w-full h-full max-h-[85vh] object-contain"
        />
      </div>
    </div>
  );
};

export default VideoModal;
