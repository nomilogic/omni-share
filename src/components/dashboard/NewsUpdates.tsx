import { useEffect, useState } from "react";
import laptop from "../../assets/dashboard-1.svg";
import mobile from "../../assets/dashboard-2.svg";
import tablet from "../../assets/dashboard-3.svg";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper";

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

  return (
    <div className="bg-gray-100 rounded-md p-5 flex flex-col w-full h-[450px]">
      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        loop={true}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 5000, // Slide change delay in ms
          disableOnInteraction: false, // Allow autoplay even after user interaction
        }}
        modules={[Autoplay, Pagination]}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
              <img
                src={slide.image}
                alt={`slide-${index}`}
                className="h-48 w-auto object-contain"
              />
              <p className="text-sm text-black text-center mt-5 min-h-[60px]">
                {slide.text}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default NewsUpdates;
