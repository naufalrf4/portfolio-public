import { useState, useEffect, type FC } from 'react';
import { Button } from '../shared/Button';
import { ResponsiveModal } from '../shared/ResponsiveModal';
import { ThreeDCard, CardItem, Marquee } from '@/components/ui';
import {
  Award,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  name: string;
  location: string;
  monthYear: string;
  photos: string[];
  description: string;
  externalUrl: string | null;
  order: number;
  createdAt: string;
}

interface AchievementsDisplayProps {
  achievements?: Achievement[];
}

interface AchievementCardProps {
  achievement: Achievement;
  onClick: () => void;
}

interface AchievementModalProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
}

function repeatForRow(cardCount: number): number {
  if (cardCount <= 0) return 4;
  return Math.max(3, Math.ceil(6 / cardCount));
}

const mediaPlaceholder = (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-bg-elevated px-5 text-center text-text-secondary">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-elevated">
      <ImageIcon className="h-5 w-5 text-text-secondary" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-semibold text-text-primary">Achievement media</p>
      <p className="text-xs leading-relaxed text-text-secondary">
        No image uploaded yet for this achievement.
      </p>
    </div>
  </div>
);

const AchievementCard: FC<AchievementCardProps> = ({ achievement, onClick }) => {
  const hasPhotos = achievement.photos && achievement.photos.length > 0;
  const firstPhoto = hasPhotos ? achievement.photos[0] : null;

  return (
    <div className="w-[248px] flex-shrink-0 sm:w-[272px] md:w-[286px]">
      <ThreeDCard className="w-full" maxTilt={8}>
        <button onClick={onClick} className="group block w-full cursor-pointer text-left">
          <div className="flex h-[288px] flex-col overflow-hidden rounded-xl bg-bg-card border border-line transition-colors duration-300 group-hover:border-line-hover">
            <CardItem translateZ={25}>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-b-[20px] bg-bg-elevated border border-line">
                {firstPhoto ? (
                  <img
                    src={firstPhoto}
                    alt={achievement.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  mediaPlaceholder
                )}
              </div>
            </CardItem>

            <CardItem translateZ={15} className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col px-4 pb-4 pt-4">
                <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-bold leading-snug text-text-primary sm:text-base">
                  {achievement.name}
                </h3>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
                  {achievement.monthYear}
                </p>
              </div>
            </CardItem>
          </div>
        </button>
      </ThreeDCard>
    </div>
  );
};

const AchievementModal: FC<AchievementModalProps> = ({ achievement, isOpen, onClose }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const hasPhotos = achievement.photos && achievement.photos.length > 0;
  const hasMultiplePhotos = hasPhotos && achievement.photos.length > 1;

  useEffect(() => {
    if (isOpen) {
      setCurrentPhotoIndex(0);
    }
  }, [isOpen]);

  const nextPhoto = () => {
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % achievement.photos.length);
    }
  };

  const prevPhoto = () => {
    if (hasPhotos) {
      setCurrentPhotoIndex(
        (prev) => (prev - 1 + achievement.photos.length) % achievement.photos.length
      );
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={achievement.name}
      titleId={`achievement-modal-title-${achievement.id}`}
      description="Focused details, supporting images, and the certificate link in a softer white achievement view."
      desktopWidthClassName="max-w-[min(920px,calc(100vw-3rem))]"
      contentClassName="bg-bg-elevated"
      bodyClassName="px-5 pb-5 md:px-6 md:pb-6"
      footer={
        achievement.externalUrl ? (
          <a
            href={achievement.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center gap-2 rounded-xl"
            >
              <ExternalLink className="h-4 w-4" />
              View Certificate
            </Button>
          </a>
        ) : undefined
      }
    >
      <div className="space-y-4 md:space-y-5">
        <div className="space-y-3">
          <div className="relative mx-auto aspect-[16/10] max-w-[680px] overflow-hidden rounded-xl bg-bg-elevated">
            {hasPhotos ? (
              <img
                src={achievement.photos[currentPhotoIndex]}
                alt={achievement.name}
                className="h-full w-full object-contain p-2 md:p-3"
                loading="lazy"
              />
            ) : (
              mediaPlaceholder
            )}

            {hasMultiplePhotos ? (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl bg-bg-card/90 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="h-4.5 w-4.5 text-text-secondary" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-2xl bg-bg-card/90 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="h-4.5 w-4.5 text-text-secondary" />
                </button>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-bg-card/90 px-3 py-1.5 backdrop-blur-sm">
                  {achievement.photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-200',
                        idx === currentPhotoIndex
                          ? 'w-7 bg-line-hover'
                          : 'w-2 bg-line hover:bg-line-hover'
                      )}
                    />
                  ))}
                </div>

                <div className="absolute right-3 top-3 rounded-full bg-bg-card/90 px-3 py-1 text-xs font-semibold text-text-secondary">
                  {currentPhotoIndex + 1} / {achievement.photos.length}
                </div>
              </>
            ) : null}
          </div>

          {hasMultiplePhotos ? (
            <div className="scrollbar-hide mx-auto flex max-w-[680px] gap-2.5 overflow-x-auto pb-1">
              {achievement.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPhotoIndex(idx)}
                  className={cn(
                    'h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-200',
                    idx === currentPhotoIndex
                      ? 'scale-[1.03] ring-2 ring-teal/40 border border-line'
                      : 'opacity-65 border border-line hover:opacity-100'
                  )}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="inline-flex items-center gap-2 rounded-lg bg-bg-elevated px-3.5 py-3 text-sm">
            <MapPin className="h-4 w-4 text-text-secondary" />
            <span className="text-text-secondary">{achievement.location}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-bg-elevated px-3.5 py-3 text-sm">
            <Calendar className="h-4 w-4 text-text-secondary" />
            <span className="text-text-secondary">{achievement.monthYear}</span>
          </div>
        </div>

        {achievement.description ? (
          <div className="rounded-xl bg-bg-elevated px-4 py-3.5">
            <p className="whitespace-pre-line text-sm leading-7 text-text-secondary md:text-[15px]">
              {achievement.description}
            </p>
          </div>
        ) : null}
      </div>
    </ResponsiveModal>
  );
};

export const AchievementsDisplay: FC<AchievementsDisplayProps> = ({ achievements }) => {
  const items = achievements ?? [];
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="rounded-xl bg-bg-elevated px-4 py-5 border border-line md:px-5 md:py-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bg-elevated border border-line">
            <Award className="h-5 w-5 text-text-secondary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary md:text-xl">Achievements</h2>
            <p className="text-xs text-text-secondary">
              {items.length} {items.length === 1 ? 'achievement' : 'achievements'}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--bg-elevated)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--bg-elevated)] to-transparent" />

          <Marquee
            pauseOnHover
            repeat={repeatForRow(items.length)}
            className="w-full [--duration:60s] [--gap:0.75rem] md:[--gap:1rem]"
          >
            {items.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onClick={() => setSelectedAchievement(achievement)}
              />
            ))}
          </Marquee>
        </div>
      </div>

      {selectedAchievement ? (
        <AchievementModal
          achievement={selectedAchievement}
          isOpen={true}
          onClose={() => setSelectedAchievement(null)}
        />
      ) : null}
    </>
  );
};
