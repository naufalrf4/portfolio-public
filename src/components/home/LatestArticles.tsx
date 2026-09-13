import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { BlogLink } from '@/types';
import { ThreeDCard, CardItem, BorderBeam, BlurFade } from '@/components/ui';

interface LatestArticlesProps {
  blogs?: BlogLink[];
}

export function LatestArticles({ blogs }: LatestArticlesProps) {
  const latestBlogs = (blogs ?? []).slice(0, 6);
  const isEmpty = latestBlogs.length === 0;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = latestBlogs[selectedIndex] ?? latestBlogs[0];
  const rest = latestBlogs.filter((_, i) => i !== selectedIndex).slice(0, 5);

  return (
    <section data-scene="flow" className="relative w-full border-t border-line py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {}
        <BlurFade direction="up" offset={24} className="mb-10 flex flex-col items-start">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-teal mb-4">05 / Field Notes</span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-6xl">
            Latest Articles
          </h2>
          <p className="mt-6 max-w-md text-base text-text-secondary md:text-lg">
            Notes from building, breaking, and shipping systems.
          </p>
        </BlurFade>

        {isEmpty ? (
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
            <div className="flex flex-col justify-center border-l border-line pl-6 py-12">
              <span className="font-mono text-xs uppercase tracking-widest text-teal mb-4">STATUS: DRAFTING</span>
              <p className="font-display text-2xl font-bold text-text-primary md:text-3xl">Writing in progress</p>
              <p className="mt-3 text-base text-text-secondary md:text-lg">Notes from building, breaking, and shipping systems will be published here shortly.</p>
            </div>
            <div className="flex flex-col border-t border-line lg:border-l lg:border-t-0 lg:pl-8">
              <div className="flex flex-col border-b border-line py-6 md:py-8 lg:px-6">
                <div className="mb-3 flex items-center gap-3 text-text-tertiary">
                  <span className="font-mono text-[10px] uppercase tracking-wider">01</span>
                </div>
                <h4 className="font-display text-lg font-bold text-text-primary md:text-xl">Upcoming systems write-ups</h4>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">STAY TUNED</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
            {}
            {selected && (
              <BlurFade direction="up" offset={20} className="lg:-ml-8 lg:pr-4">
                <ThreeDCard maxTilt={6} className="group">
                  <AnimatePresence mode="wait">
                    <motion.a
                      key={selected.id}
                      href={selected.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <div className="relative rounded-2xl border border-line bg-bg-card p-4 transition-colors duration-500 group-hover:border-line-hover md:p-5">
                        <BorderBeam duration={8} />
                        <CardItem translateZ={30}>
                          <div className="mb-5 overflow-hidden rounded-lg border border-line bg-bg-elevated">
                            {selected.imageUrl ? (
                              <img
                                src={selected.imageUrl}
                                alt={selected.title}
                                loading="lazy"
                                className="aspect-[16/9] max-h-64 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex aspect-[16/9] max-h-64 w-full items-center justify-center bg-bg-card text-text-tertiary">
                                <span className="font-display text-5xl font-bold opacity-30">{selected.title.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                        </CardItem>
                        <CardItem translateZ={16}>
                          <div className="flex items-center gap-3 text-text-tertiary">
                            <span className="font-mono text-xs uppercase tracking-widest">{selected.source}</span>
                            <span className="h-px w-8 bg-line"></span>
                            <span className="font-mono text-[10px] uppercase tracking-wider">{selected.publishedAt ? formatDate(selected.publishedAt) : ''}</span>
                          </div>
                          <h3 className="mt-3 font-display text-xl font-bold text-text-primary transition-colors group-hover:text-teal md:text-2xl lg:text-3xl">
                            {selected.title}
                          </h3>
                          {selected.description && (
                            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary md:text-base">
                              {selected.description}
                            </p>
                          )}
                        </CardItem>
                      </div>
                    </motion.a>
                  </AnimatePresence>
                </ThreeDCard>
              </BlurFade>
            )}

            {}
            <div className="flex flex-col border-t border-line lg:border-l lg:border-t-0 lg:pl-8">
              {rest.map((blog) => {
                const originalIndex = latestBlogs.findIndex((b) => b.id === blog.id);
                const listNumber = String(originalIndex + 1).padStart(2, '0');
                return (
                  <BlurFade key={blog.id} direction="left" offset={24} delay={0.05}>
                    <div className="group flex w-full items-stretch border-b border-line transition-colors hover:bg-bg-card/50">
                      <a
                        href={blog.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 flex-col py-6 text-left md:py-8 lg:pl-6"
                        aria-label={`Read: ${blog.title}`}
                      >
                        <div className="mb-3 flex items-center gap-3 text-text-tertiary">
                          <span className="font-mono text-[10px] uppercase tracking-wider">{listNumber}</span>
                          <span className="font-mono text-[10px] uppercase tracking-wider">{blog.publishedAt ? formatDate(blog.publishedAt) : ''}</span>
                        </div>
                        <h4 className="font-display text-lg font-bold text-text-primary transition-colors group-hover:text-teal md:text-xl">
                          {blog.title}
                        </h4>
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(originalIndex)}
                        onMouseEnter={() => setSelectedIndex(originalIndex)}
                        className="flex w-16 shrink-0 items-center justify-center border-l border-line text-text-tertiary transition-colors hover:bg-bg-card hover:text-teal"
                        aria-label={`Preview: ${blog.title}`}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </BlurFade>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
