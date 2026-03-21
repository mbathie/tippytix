'use client';

import { useState, useEffect } from 'react';

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&q=80',
    alt: 'Concert crowd with stage lights',
  },
  {
    url: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=1920&q=80',
    alt: 'Art gallery exhibition opening',
  },
  {
    url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1920&q=80',
    alt: 'Theatre stage performance with dramatic lighting',
  },
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80',
    alt: 'Music festival at night',
  },
  {
    url: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=1920&q=80',
    alt: 'Stand-up comedy performance on stage',
  },
  {
    url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80',
    alt: 'Outdoor festival crowd at sunset',
  },
  {
    url: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1920&q=80',
    alt: 'Intimate live performance venue',
  },
];

export function HeroBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0">
      {heroImages.map((image, index) => (
        <div
          key={image.url}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{
            opacity: index === currentIndex ? 1 : 0,
          }}
        >
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
    </div>
  );
}
