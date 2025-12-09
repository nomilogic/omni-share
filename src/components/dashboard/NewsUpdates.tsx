import { useState, useEffect } from "react";
import laptop from "../../assets/dashboard-1.svg";
import mobile from "../../assets/dashboard-2.svg";
import tablet from "../../assets/dashboard-3.svg";
import { useTranslation } from "react-i18next";

function NewsUpdates() {
  const { t, i18n } = useTranslation();
    const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  const slides = [
    {
      image: mobile,
      text: t("draft_posts_message"),
    },
    {
      image: laptop,
      text: t("scheduled_posts_message"),
    },
    {
      image: tablet,
      text: t("teams_permissions_message"),
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // change slide every 3 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [slides.length]);

  return (
    <div className="bg-gray-100 rounded-md p-5 flex flex-col w-full h-[450px]">
      <div className="flex-1 flex flex-col items-center">
        <img src={slides[currentSlide].image} alt="slide" className="" />
        <p className="text-sm text-black text-center mt-5">
          {slides[currentSlide].text}
        </p>
      </div>

      <div className="flex mb-2 justify-center gap-2 mt-auto">
        {slides.map((_, i) => (
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
