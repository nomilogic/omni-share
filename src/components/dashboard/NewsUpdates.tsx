import { useState } from "react";
import laptop from "../../assets/laptop.png";

function NewsUpdates() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="bg-gray-100 rounded-xl  p-5  flex flex-col w-full h-full ">
      <div className="flex-1  flex flex-col">
        <img src={laptop} alt="laptop" />

        <p className="text-xs text-black ">
          We'll soon be launching our Scheduled Post & Announcement feature –
          stay tuned for the official release!
        </p>
      </div>

      <div className="flex mb-2 justify-center gap-2 mt-auto">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === i ? "bg-[#7650e3]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default NewsUpdates;
