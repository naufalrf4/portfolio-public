import React, { useState } from 'react';
import { Calendar, ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { AboutData } from '../../types';
import { filterPublicSocialLinks } from '@/lib/social-links';
import { faqs } from '@/components/services/data';
import { Card } from '../shared/Card';
import { BookingCalendar } from './BookingCalendar';
import { ContactForm } from './ContactForm';
import { ContactInfo } from './ContactInfo';
import { BlurFade, BorderBeam, Meteors } from '@/components/ui';

interface ContactContentProps {
  aboutData: AboutData;
  turnstileSiteKey: string;
}

type Tab = 'form' | 'booking';

export function ContactContent({ aboutData, turnstileSiteKey }: ContactContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('form');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <BlurFade delay={0.12} inView className="lg:col-span-7">
            <div className="mb-6 rounded-xl border-line bg-bg-elevated p-1.5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  onClick={() => setActiveTab('form')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-medium transition-all duration-200',
                    activeTab === 'form'
                      ? 'bg-[var(--teal-soft)] text-teal border-teal/30'
                      : 'text-text-secondary border-transparent hover:text-teal hover:bg-bg-card'
                  )}
                >
                  <Mail size={20} />
                  Send Message
                </button>
                <button
                  onClick={() => setActiveTab('booking')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-medium transition-all duration-200',
                    activeTab === 'booking'
                      ? 'bg-[var(--teal-soft)] text-teal border-teal/30'
                      : 'text-text-secondary border-transparent hover:text-teal hover:bg-bg-card'
                  )}
                >
                  <Calendar size={20} />
                  Book a Call
                </button>
              </div>
            </div>

            <Card className="relative overflow-hidden p-6 md:p-8">
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-60">
                <Meteors number={8} />
              </div>
              {activeTab === 'form' ? (
                <ContactForm turnstileSiteKey={turnstileSiteKey} />
              ) : (
                <BookingCalendar turnstileSiteKey={turnstileSiteKey} />
              )}
              <BorderBeam size={60} duration={8} />
            </Card>
          </BlurFade>

          <BlurFade delay={0.05} inView className="lg:col-span-5">
            <ContactInfo
              location={aboutData.location}
              email={aboutData.email}
              socialLinks={filterPublicSocialLinks(aboutData.socialLinks)}
              availabilityStatus={aboutData.availabilityStatus}
              error={null}
            />
          </BlurFade>
        </div>

        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-elevated border border-line">
              <HelpCircle className="h-6 w-6 text-teal" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Frequently Asked Questions</h2>
              <p className="text-text-secondary">
                Quick answers before you send a message or reserve time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqId === faq.id;
              return (
                <BlurFade key={faq.id} delay={0.1 + index * 0.06} inView>
                  <Card className="overflow-hidden transition-colors hover:border-line-hover">
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      className="flex w-full cursor-pointer items-center justify-between text-left"
                    >
                      <h3 className="pr-4 font-semibold text-text-primary">{faq.question}</h3>
                      <ChevronDown
                        size={20}
                        aria-hidden="true"
                        className={cn(
                          'flex-shrink-0 text-text-secondary transition-transform duration-300 ease-in-out',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    <div
                      id={`faq-answer-${faq.id}`}
                      className={cn(
                        'grid transition-all duration-300 ease-in-out',
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-4 leading-relaxed text-text-secondary">{faq.answer}</p>
                      </div>
                    </div>
                  </Card>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
