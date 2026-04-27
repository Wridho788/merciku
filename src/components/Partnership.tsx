import React, { useState, useEffect, useRef } from 'react';
import { useSlider } from '../api/hooks';
import './Partnership.css';

interface PartnershipProps {
  className?: string;
}

export const Partnership: React.FC<PartnershipProps> = ({ className }) => {
  const { data: sliderData } = useSlider();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Check if sliderData has valid result
  const hasValidData =
    sliderData?.result &&
    Array.isArray(sliderData.result) &&
    sliderData.result.length > 0;

  // Don't render if no valid data
  if (sliderData && !hasValidData) {
    return null;
  }

  // Use API data if available
  type Sponsor = {
    id: number | string;
    name: string;
    image: string;
    url?: string;
    alt?: string;
  };
  
  const sponsors: Sponsor[] =
    sliderData?.result && Array.isArray(sliderData.result)
      ? sliderData.result
          .filter((item: any) => item.image) // Filter out items without images
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            image: `${sliderData.image_url}${item.image}`, // Combine base URL with filename
            url: item.url && item.url !== '#' ? item.url : undefined, // Skip # URLs
            alt: item.name,
          }))
      : [];

  // Auto slide every 5 seconds (pause when dragging)
  useEffect(() => {
    if (isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sponsors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sponsors.length, isDragging]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSlideClick = (sponsor: Sponsor) => {
    // Only open URL if not dragging
    if (!isDragging && sponsor.url) {
      window.open(sponsor.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Touch/Mouse event handlers for swipe
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
    setDragOffset(0);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    setCurrentX(clientX);
    const diff = clientX - startX;
    setDragOffset(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const diff = currentX - startX;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe right - previous slide
        setCurrentSlide((prev) => (prev - 1 + sponsors.length) % sponsors.length);
      } else {
        // Swipe left - next slide
        setCurrentSlide((prev) => (prev + 1) % sponsors.length);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
    setStartX(0);
    setCurrentX(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  return (
    <div className={`partnership ${className || ''}`}>
      <div 
        className="partnership-slider"
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="partnership-slides"
          style={{
            transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {sponsors.map((sponsor: Sponsor) => (
            <div 
              key={sponsor.id} 
              className="partnership-slide"
              onClick={() => handleSlideClick(sponsor)}
              style={{ 
                cursor: sponsor.url ? 'pointer' : 'default',
                userSelect: 'none'
              }}
              role={sponsor.url ? "button" : undefined}
              tabIndex={sponsor.url ? 0 : undefined}
              onKeyDown={sponsor.url ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSlideClick(sponsor);
                }
              } : undefined}
              aria-label={sponsor.url ? `Visit ${sponsor.name} website` : undefined}
            >
              <img
                src={sponsor.image}
                alt={sponsor.alt}
                className="sponsor-image"
                draggable={false}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="slider-dots">
        {sponsors.map((_: Sponsor, index: number) => (
          <div
            key={index}
            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};