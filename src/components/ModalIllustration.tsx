import React from "react";
import ModalIllustrationPng from "../assets/cancle-popup.png";

const ModalIllustration = () => (
  <div className="relative w-full h-full bg-[#7650e3]  md:rounded-l-[22.5px] md:rounded-r-[0]  overflow-hidden flex items-center justify-center ">
    <img
      src={ModalIllustrationPng}
      alt="Pause Illustration"
      className="w-full h-full object-contain"
    />
  </div>
);

export default ModalIllustration;
