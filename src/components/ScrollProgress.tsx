import React, { useState, useEffect } from 'react';

interface ScrollProgressProps {
  className?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ className = '' }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop || document.body.scrollTop;
      const winHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (winHeight > 0) {
        const scrolled = (scrollPx / winHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, scrolled)));
      } else {
        setScrollProgress(0);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      id="scroll-progress-container"
      className={`fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-transparent ${className}`}
      aria-hidden="true"
    >
      <div
        id="scroll-progress-indicator"
        className="h-full bg-[var(--color-gold)] transition-[width] duration-75 ease-out shadow-[0_0_12px_var(--color-gold)]"
        style={{
          width: `${scrollProgress}%`,
        }}
      />
    </div>
  );
};
