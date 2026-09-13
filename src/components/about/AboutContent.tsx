import { useState, type FC, type ComponentType } from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { ExperienceTabs } from './ExperienceTabs';
import { SkillBadges } from './SkillBadges';
import { AchievementsDisplay, type Achievement } from './AchievementsDisplay';
import { BlurFade, BorderBeam } from '@/components/ui';
import {
  MapPin,
  Mail,
  Download,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Globe,
} from 'lucide-react';
import type { AboutData } from '../../types';
import { filterPublicSocialLinks } from '@/lib/social-links';

interface AboutContentProps {
  about: AboutData;
  achievements: Achievement[];
}

const socialIcons: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  email: Mail,
  website: Globe,
};

export const AboutContent: FC<AboutContentProps> = ({ about, achievements }) => {
  const fullName = about.fullName?.trim() || 'NaufalRF';
  const socialLinksList = filterPublicSocialLinks(about.socialLinks);
  const [mobileTab, setMobileTab] = useState<'about' | 'skills'>('about');
  const hasSkills = Boolean(about.skills && about.skills.length > 0);

  return (
    <div className="animate-fade-in space-y-12">
      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-5 space-y-6">
          <BlurFade>
            <Card className="relative p-6 md:p-8 overflow-hidden">
              <BorderBeam size={80} duration={8} />
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 rounded-full border border-line bg-bg-card p-1.5 mb-6">
                  <div className="w-full h-full rounded-full overflow-hidden border border-line relative">
                    {about.avatarUrl ? (
                      <img
                        src={about.avatarUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-4xl md:text-5xl text-white font-bold">
                          {fullName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 max-w-full break-words">{fullName}</h1>
                {about.tagline && (
                  <p className="text-primary font-medium text-lg mb-2 max-w-full break-words">{about.tagline}</p>
                )}

                <div className="flex w-full min-w-0 max-w-full flex-col items-center gap-2 text-sm text-muted-foreground mb-6">
                  {about.location && (
                    <div className="flex min-w-0 max-w-full items-center justify-center gap-2">
                      <MapPin size={16} className="shrink-0 text-primary" />
                      <span className="min-w-0 break-words">{about.location}</span>
                    </div>
                  )}
                  {about.email && (
                    <a
                      href={`mailto:${about.email}`}
                      className="flex min-w-0 max-w-full items-center justify-center gap-2 hover:text-primary transition-colors"
                    >
                      <Mail size={16} className="shrink-0 text-primary" />
                      <span className="min-w-0 break-all">{about.email}</span>
                    </a>
                  )}
                </div>

                {socialLinksList.length > 0 && (
                  <div className="flex items-center justify-center gap-3 mb-4">
                    {socialLinksList.map((link, index) => {
                      const Icon = socialIcons[link.platform.toLowerCase()] || Globe;
                      return (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl text-muted-foreground hover:text-primary transition-all duration-200 bg-bg-card border border-line hover:border-line-hover"
                          aria-label={link.platform}
                        >
                          <Icon size={20} />
                        </a>
                      );
                    })}
                  </div>
                )}

                {about.resumeUrl && (
                  <a href={about.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="accent" size="md">
                      <Download size={18} className="mr-2" />
                      Download CV
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          </BlurFade>

          <div className="lg:hidden">
            {hasSkills ? (
              <Card className="p-4">
                <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-line bg-bg-elevated p-1.5">
                  <button
                    type="button"
                    onClick={() => setMobileTab('about')}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                      mobileTab === 'about'
                        ? 'bg-[var(--teal-soft)] text-teal border border-teal/30'
                        : 'text-text-secondary border border-transparent hover:text-teal'
                    }`}
                  >
                    About Me
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('skills')}
                    className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                      mobileTab === 'skills'
                        ? 'bg-[var(--teal-soft)] text-teal border border-teal/30'
                        : 'text-text-secondary border border-transparent hover:text-teal'
                    }`}
                  >
                    Skills
                  </button>
                </div>

                <div className="mt-5">
                  {mobileTab === 'about' ? (
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-4">About Me</h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {about.bio}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-6">
                        Skills & Technologies
                      </h2>
                      <SkillBadges skills={about.skills} />
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-foreground mb-4">About Me</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {about.bio}
                </p>
              </Card>
            )}
          </div>

          <div className="hidden lg:block space-y-6">
            <BlurFade>
              <Card className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-foreground mb-4">About Me</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {about.bio}
                </p>
              </Card>
            </BlurFade>

            {hasSkills && (
              <BlurFade>
                <Card className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-foreground mb-6">Skills & Technologies</h2>
                  <SkillBadges skills={about.skills} />
                </Card>
              </BlurFade>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Experience, Education & Certifications
            </h2>
            {about.experience && about.experience.length > 0 ? (
              <ExperienceTabs experience={about.experience} />
            ) : (
              <Card>
                <p className="text-muted-foreground text-center py-8">
                  No experience data available.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {achievements && achievements.length > 0 && (
        <BlurFade>
          <AchievementsDisplay achievements={achievements} />
        </BlurFade>
      )}
    </div>
  );
};
