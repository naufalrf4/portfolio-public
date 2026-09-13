import React from 'react';
import type { ComponentType } from 'react';
import { Card } from '../shared/Card';
import {
  MapPin,
  Mail,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Globe,
  AlertCircle,
} from 'lucide-react';
import type { SocialLink } from '../../types';
import { detectPublicSocialPlatform } from '@/lib/social-links';

interface ContactInfoProps {
  location?: string | null;
  email?: string;
  socialLinks?: SocialLink[];
  availabilityStatus?: 'available' | 'busy' | 'unavailable' | null;
  error?: string | null;
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

export function ContactInfo({
  location,
  email,
  socialLinks = [],
  availabilityStatus,
  error,
}: ContactInfoProps) {
  return (
    <Card className="p-6 md:p-8 h-full">
      <div className="flex flex-col h-full">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Get in Touch</h2>
        <p className="text-text-secondary mb-8">
          Have a question or want to work together? I&apos;d love to hear from you.
        </p>

        {error ? (
          <div className="flex items-start gap-3 p-4 rounded-lg border border-[var(--error)]/40 bg-[var(--error)]/10 mb-6">
            <AlertCircle size={20} className="text-[var(--error)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--error)]">Failed to load contact information</p>
              <p className="text-xs text-[var(--error)] mt-1">{error}</p>
            </div>
          </div>
        ) : null}

        <div className="space-y-4 mb-8">
          {location && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-line flex items-center justify-center">
                <MapPin size={18} className="text-teal" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Location</p>
                <p className="text-text-primary font-medium">{location}</p>
              </div>
            </div>
          )}

          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-line flex items-center justify-center transition-all duration-200 group-hover:border-line-hover">
                <Mail size={18} className="text-teal" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <p className="text-text-primary font-medium group-hover:text-teal transition-colors">
                  {email}
                </p>
              </div>
            </a>
          )}

          {availabilityStatus && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-line flex items-center justify-center">
                {availabilityStatus === 'available' ? (
                  <div className="w-3 h-3 rounded-full bg-green animate-pulse" />
                ) : availabilityStatus === 'busy' ? (
                  <div className="w-3 h-3 rounded-full bg-amber" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-line-hover" />
                )}
              </div>
              <div>
                <p className="text-sm text-text-secondary">Status</p>
                <p className="text-text-primary font-medium">
                  {availabilityStatus === 'available' && 'Available to work'}
                  {availabilityStatus === 'busy' && 'Currently busy'}
                  {availabilityStatus === 'unavailable' && 'Not available'}
                </p>
              </div>
            </div>
          )}
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-auto">
            <p className="text-sm text-text-secondary mb-4">Connect with me</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => {
                const platform = detectPublicSocialPlatform(link) ?? link.platform.toLowerCase();
                const Icon = socialIcons[platform] || Globe;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl text-text-secondary hover:text-teal transition-all duration-200 border border-line"
                    aria-label={link.platform}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
