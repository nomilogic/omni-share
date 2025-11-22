import React from "react";
import mainImage from "../assets/omni.jpg";

const TwoColumnSection: React.FC = () => {
  return (
    <section
      className=" max-w-[80%] mx-auto px-0 md:px-0
        grid md:grid-cols-2  gap-10
        
        items-center w-full  bg-white
      "
    >
      
      {/* Left Side - Image */}
      <div className="flex justify-center w-full ml-auto">
        <img src={mainImage} className="rounded-lg max-w-full h-auto" />
      </div>
      <div className="w-full flex flex-col gap-4 ">
        <h2 className=" font-bold text-4xl sm:text-5xl   text-black">
          React to the <span className="text-purple-600">trends</span> that
          matter
        </h2>
        <p className="leading-relaxed text-base sm:text-lg text-gray-500                 ">
          Access the world’s largest archive of consumer opinion and leverage
          advanced proprietary and generative AI to <strong>
            discover new trends before anyone else and make smarter decisions.
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
            Get started
            <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TwoColumnSection;
