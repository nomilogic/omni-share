import React from "react";
import mainImage from "../assets/Omni sshare-layout-02.png";

const TwoColumnSection2 = () => {
  return (
    <section
      className=" my-10 relative max-w-[80%] mx-auto px-0 md:px-0
        grid md:grid-cols-2  gap-10
        
        items-center w-full  bg-white
      "
    >
      <div className="flex flex-col gap-4">
        <h2
          className="
            font-bold 
            text-4xl sm:text-5xl 
          text-black
          "
        >
          <span className="text-purple-600">Manage</span> all channels with ease
        </h2>

        <p
          className="
            text-base sm:text-lg text-gray-500
           
          "
        >
          Monitor emerging threats across over 100m sources and set up smart,
          real-time alerts to{" "}
          <strong>
            respond with speed and confidence before problems develop.
          </strong>
        </p>
        <div>
          <button
            className="
            group px-6 py-2.5 border border-purple-600 
            text-purple-600 font-semibold rounded-md 
            hover:bg-purple-100 transition 
          "
          >
            Get started{" "}
            <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>

      <div
        className="
   w-full 
   h-full
   
  "
      >
        <img
          src={mainImage}
          className="
            w-full h-full object-cover rounded-lg
          "
        />
      </div>
    </section>
  );
};

export default TwoColumnSection2;
