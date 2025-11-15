import { useEffect, useRef, useState } from "react";

export const Counter = ({ end, duration = 1000, suffix = "" }: any) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Trigger animation only when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = end / (duration / 16);

          const animate = () => {
            start += increment;
            if (start < end) {
              setValue(Math.floor(start));
              requestAnimationFrame(animate);
            } else {
              setValue(end);
            }
          };

          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
  }, [end, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};
