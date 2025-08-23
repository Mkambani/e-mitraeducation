import React, { useState, useEffect, useRef } from 'react';
import { PromoBannerSlide } from '../types';

interface PromoBannerProps {
  slides: PromoBannerSlide[];
}

const PromoBanner: React.FC<PromoBannerProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const imageSlides = slides.filter(s => s.image_url || s.mobile_image_url);
  const timeoutRef = useRef<number | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (imageSlides.length <= 1) return;
    resetTimeout();
    timeoutRef.current = window.setTimeout(
      () => setCurrentSlide((prev) => (prev + 1) % imageSlides.length),
      5000
    );
    return () => {
      resetTimeout();
    };
  }, [currentSlide, imageSlides.length]);

  if (imageSlides.length === 0) {
    return null;
  }
  
  // Wrapper component for slides to handle link logic
  const SlideWrapper: React.FC<{ slide: PromoBannerSlide; children: React.ReactNode; className?: string }> = ({ slide, children, className }) => {
    if (slide.link_url) {
      return (
        <a 
          href={slide.link_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={className}
          aria-label={`Promotional Banner for ${slide.link_url}`}
        >
          {children}
        </a>
      );
    }
    return <div className={className}>{children}</div>;
  };

  return (
    <section className="my-6 relative [perspective:1000px]">
      {/* Changed aspect ratio to be responsive: 16:9 on mobile, 3:1 on desktop. */}
      <div className="relative aspect-[16/9] md:aspect-[3/1] w-full overflow-hidden rounded-2xl transition-transform duration-500 ease-in-out hover:[transform:rotateX(5deg)_rotateY(-5deg)_scale(1.02)] [transform-style:preserve-3d]">
        {imageSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          let positionClass = 'translate-x-full';
          if (isActive) {
            positionClass = 'translate-x-0';
          } else if (index === (currentSlide - 1 + imageSlides.length) % imageSlides.length) {
            positionClass = '-translate-x-full';
          }

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-1000 [transition-timing-function:cubic-bezier(0.65,0,0.35,1)] transform-gpu ${positionClass}`}
              aria-hidden={!isActive}
            >
              <SlideWrapper slide={slide} className="group block w-full h-full bg-slate-800 dark:bg-black">
                <picture className="w-full h-full">
                  {/* If mobile image exists, use it for screens up to 768px wide */}
                  {slide.mobile_image_url && <source media="(max-width: 768px)" srcSet={slide.mobile_image_url} />}
                  {/* Always provide desktop image for larger screens */}
                  {slide.image_url && <source media="(min-width: 769px)" srcSet={slide.image_url} />}
                  {/* Fallback img tag. It will use the desktop URL, or mobile if desktop is missing. */}
                  <img
                    src={slide.image_url || slide.mobile_image_url!}
                    alt={`Promotional Banner ${index + 1}`}
                    className="block w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:brightness-110"
                  />
                </picture>
                <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]"></div>
              </SlideWrapper>
            </div>
          );
        })}
        
        {imageSlides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20 bg-black/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
            {imageSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${currentSlide === index ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromoBanner;