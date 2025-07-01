import { useEffect, useState, useRef } from "react";

const useAdVisibility = (onVisible: () => void, threshold = 1000) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeoutId = setTimeout(() => {
            setIsVisible(true);
            onVisible();
          }, threshold); // 1秒（1000ms）表示されたらカウント
        } else {
          if (timeoutId) clearTimeout(timeoutId);
          setIsVisible(false);
        }
      },
      { threshold: 0.5 }, // 50%以上が表示されたとき
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onVisible, threshold]);

  return ref;
};

export default useAdVisibility;
