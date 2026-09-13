import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ProjectImage } from '../../types';

interface ImageCarouselProps {
  images: ProjectImage[];
  title: string;
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeTitle = title?.trim() || 'Untitled Project';

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
        <span className="text-7xl text-white font-bold opacity-80">{safeTitle.charAt(0)}</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0].url}
        alt={images[0].alt || safeTitle}
        className="w-full h-full object-cover"
        loading="eager"
      />
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-full group">
      <img
        src={images[currentIndex].url}
        alt={images[currentIndex].alt || safeTitle}
        className="w-full h-full object-cover transition-opacity duration-300"
        loading={currentIndex === 0 ? 'eager' : 'lazy'}
      />

      <button
        onClick={goToPrevious}
        data-analytics-button
        data-entity-type="project_gallery_prev"
        data-entity-id={safeTitle}
        data-entity-label={`Previous image: ${safeTitle}`}
        className={cn(
          'absolute left-4 top-1/2 -translate-y-1/2 z-10',
          'bg-bg-elevated rounded-full p-3',
          'border border-line',
          '',
          'transition-all duration-200',
          'opacity-0 group-hover:opacity-100'
        )}
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 text-teal" />
      </button>

      <button
        onClick={goToNext}
        data-analytics-button
        data-entity-type="project_gallery_next"
        data-entity-id={safeTitle}
        data-entity-label={`Next image: ${safeTitle}`}
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 z-10',
          'bg-bg-elevated rounded-full p-3',
          'border border-line',
          '',
          'transition-all duration-200',
          'opacity-0 group-hover:opacity-100'
        )}
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 text-teal" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            data-analytics-button
            data-entity-type="project_gallery_index"
            data-entity-id={`${safeTitle}:${index + 1}`}
            data-entity-label={`Image ${index + 1}: ${safeTitle}`}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-200',
              index === currentIndex ? 'bg-teal w-8' : 'bg-bg-card/50 hover:bg-bg-card/80'
            )}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {images[currentIndex].caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
          <p className="text-white text-sm font-medium text-center">
            {images[currentIndex].caption}
          </p>
        </div>
      )}
    </div>
  );
}
