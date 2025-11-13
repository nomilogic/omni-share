import { useState } from 'react';
import laptop from '../../assets/laptop.png';

function NewsUpdates() {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div>
      <h3 className="font-medium text-gray-900 text-md mb-2">News & Updates</h3>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 h-96 flex flex-col">
        <div className="flex-1 mb-6 flex flex-col">
          <div className="bg-stone-100 rounded-lg p-6 mb-4 flex items-center justify-center flex-1">
            <img src={laptop} alt="laptop" />
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            We'll soon be launching our Scheduled Post & Announcement feature –
            stay tuned for the official release!
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-auto">
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
    </div>
  );
}

export default NewsUpdates;
