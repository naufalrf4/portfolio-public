import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { filterPublicSocialLinks } from '@/lib/social-links';
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Download,
  ArrowRight,
  Instagram,
  Youtube,
} from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { HeroFlipCard } from './HeroFlipCard';
import type { AboutData } from '@/types';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface HeroSectionProps {
  about: AboutData;
}

const GREETINGS = {
  en: "Hi, I'm",
  ms: 'Hai, saya',
  de: 'Hallo, ich bin',
  nl: 'Hallo, ik ben',
  pl: 'Cześć, jestem',
  cs: 'Ahoj, jsem',
  ro: 'Salut, sunt',
  tr: 'Merhaba, ben',
  sw: 'Habari, mimi ni',
} as const;

const GREETING_KEYS = Object.keys(GREETINGS) as (keyof typeof GREETINGS)[];

const socialIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  email: Mail,
};

export function HeroSection({ about }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isRoleVisible, setIsRoleVisible] = useState(true);
  const [isGreetingVisible, setIsGreetingVisible] = useState(true);

  const roles = about.roles?.length ? about.roles : ['System & Automation Engineer'];
  const socialLinks = filterPublicSocialLinks(about.socialLinks);
  const heroBio =
    about.shortBio?.trim() ||
    "I like turning messy problems into things that just work. Code, systems, whatever it takes.";
  const fullName = about.fullName?.trim() || 'Naufal Rizqullah Firdaus';
  const firstName = fullName.split(' ')[0];
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentYRaw = useTransform(scrollYProgress, [0, 1], [0, 32]);
  const contentOpacityRaw = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const contentY = reduceMotion ? 0 : contentYRaw;
  const contentOpacity = reduceMotion ? 1 : contentOpacityRaw;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGreetingVisible(false);
      setTimeout(() => {
        setGreetingIndex((prev) => (prev + 1) % GREETING_KEYS.length);
        setIsGreetingVisible(true);
      }, 460);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (roles.length <= 1) return;

    const interval = setInterval(() => {
      setIsRoleVisible(false);
      setTimeout(() => {
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        setIsRoleVisible(true);
      }, 460);
    }, 3000);

    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <section
      ref={sectionRef}
      data-scene="terrain"
      className="relative min-h-[100dvh] overflow-hidden"
    >
      {}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col items-stretch px-4 sm:px-6 md:flex-row lg:px-8">
      {}
      <motion.div
        className="relative z-10 order-2 flex w-full flex-col justify-center py-16 md:order-1 md:w-[62%] md:py-24 md:pr-10 lg:pr-16"
        style={{ opacity: contentOpacity }}
      >

        {}
        <motion.h1
          className="mb-6 max-w-3xl font-display text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-text-primary"
          style={{ y: contentY }}
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className={cn(
              'inline-block transition-all duration-500 ease-out',
              isGreetingVisible
                ? 'opacity-100 translate-y-0 blur-0'
                : 'opacity-0 -translate-y-3 blur-[2px]'
            )}
          >
            {GREETINGS[GREETING_KEYS[greetingIndex]]}
          </span>{' '}
          {firstName}
          <span className="text-teal">.</span>
        </motion.h1>

        {}
        <motion.div
          className="mb-6 flex h-10 items-center md:h-12"
          style={{ y: contentY }}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className={cn(
              'font-display text-xl font-semibold text-teal transition-all duration-500 ease-out md:text-2xl lg:text-3xl',
              isRoleVisible
                ? 'opacity-100 translate-y-0 blur-0'
                : 'opacity-0 translate-y-3 blur-[2px]'
            )}
          >
            {roles[currentRoleIndex]}
          </p>
        </motion.div>

        {}
        <motion.p
          className="mb-10 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg lg:text-xl"
          style={{ y: contentY }}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          {heroBio}
        </motion.p>

        {}
        <motion.div
          className="flex flex-col items-start gap-4"
          style={{ y: contentY }}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >

          <div className="flex flex-row items-center gap-3 md:gap-4">
            <a href="/about">
              <Button
                variant="accent"
                size="sm"
                className="group px-5 py-2.5 text-sm md:px-7 md:py-3 md:text-base"
              >
                See what I've made
                <ArrowRight
                  className="ml-1 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:text-amber md:ml-2"
                  size={16}
                />
              </Button>
            </a>
            {about.resumeUrl && (
              <a href={about.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="default"
                  size="sm"
                  className="group px-5 py-2.5 text-sm md:px-7 md:py-3 md:text-base"
                >
                  <Download
                    className="mr-1 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 md:mr-2"
                    size={16}
                  />
                  Grab my CV
                </Button>
              </a>
            )}
          </div>

          {}
          {socialLinks.length > 0 && (
            <motion.div
              className="flex items-center gap-2 md:hidden"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {socialLinks.slice(0, 5).map((link, index) => {
                const Icon = socialIcons[link.platform.toLowerCase()] || Mail;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-secondary transition-all duration-300 hover:border-line-hover hover:bg-bg-card/60 hover:text-teal"
                    aria-label={link.platform}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {}
      {}
      <div className="pointer-events-auto relative z-10 order-1 flex w-full flex-col items-center justify-center gap-6 border-b border-line/60 bg-bg-elevated/20 px-8 py-8 backdrop-blur-sm md:order-2 md:w-[38%] md:border-b-0 md:border-l md:py-24 lg:w-[32%] lg:px-12">
        {}
        <div className="absolute left-0 top-0 hidden h-full w-[1px] overflow-hidden opacity-30 md:block">
          <div className="h-full w-full bg-[linear-gradient(to_bottom,transparent_50%,var(--border)_50%)] bg-[length:1px_12px]" />
        </div>

        {}
        <motion.div
          className="flex w-full max-w-[240px] justify-center md:max-w-none"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroFlipCard about={about} />
        </motion.div>

        {}
        {socialLinks.length > 0 && (
          <motion.div
            className="hidden items-center justify-center gap-2 md:flex"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {socialLinks.slice(0, 5).map((link, index) => {
              const Icon = socialIcons[link.platform.toLowerCase()] || Mail;
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-secondary transition-all duration-300 hover:border-line-hover hover:bg-bg-card/60 hover:text-teal"
                  aria-label={link.platform}
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </motion.div>
        )}
      </div>
      </div>

      {}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="relative mx-auto h-full w-full max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-x-4 inset-y-0 sm:inset-x-6 lg:inset-x-8">
            <div className="hero-dot-grid absolute inset-0" />
            <div className="hero-glow-a absolute left-[10%] top-[12%] h-[24vh] w-[24vh] sm:h-[34vh] sm:w-[34vh] md:h-[42vh] md:w-[42vh] rounded-full" />
            <div className="hero-glow-b absolute bottom-[8%] right-[8%] h-[20vh] w-[20vh] sm:h-[28vh] sm:w-[28vh] md:h-[34vh] md:w-[34vh] rounded-full" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      </div>

      {}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </section>
  );
}
