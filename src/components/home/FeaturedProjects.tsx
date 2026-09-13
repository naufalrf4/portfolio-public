import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { ArrowRight } from 'lucide-react';
import type { Project } from '@/types';
import { ThreeDCard, CardItem, BorderBeam, BlurFade } from '@/components/ui';

interface FeaturedProjectsProps {
  projects?: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const featuredProjects = (projects ?? []).filter((p) => p.featured).slice(0, 6);

  if (featuredProjects.length === 0) {
    return null;
  }

  return (
    <section data-scene="circuit" className="relative w-full border-t border-line py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {}
        <BlurFade direction="up" offset={24} className="mb-10 flex flex-col items-start">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-teal mb-4">
            03 / Selected Work
          </span>
          <h2 className="max-w-lg font-display text-3xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-6xl">
            Featured Projects
          </h2>
        </BlurFade>

        {}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, index) => {
            const thumbnailUrl = project.imageUrl || project.images?.[0]?.url;
            const thumbnailAlt = project.images?.[0]?.alt || project.title;
            const isFirst = index === 0;

            return (
              <BlurFade
                key={project.id}
                direction="up"
                offset={40}
                delay={index * 0.06}
                className="block h-full w-full"
              >
                <ThreeDCard maxTilt={7} className="group h-full">
                  <a href={`/projects/${project.slug}`} className="block h-full">
                    <div className="relative h-full">
                      <Card
                        className="relative flex h-full flex-col p-4 rounded-2xl border-line transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-line-hover"
                      >
                        {isFirst && <BorderBeam />}

                        <CardItem translateZ={30}>
                          <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3 border border-line">
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt={thumbnailAlt}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                              />
                            ) : (
                              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#0d9488] to-[#3ed9c4] flex items-center justify-center">
                                <span className="text-3xl text-white font-bold">
                                  {project.title.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardItem>

                        <CardItem translateZ={20}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-base font-bold text-text-primary group-hover:text-teal transition-all duration-300 line-clamp-1">
                              {project.title}
                            </h3>
                            <Badge variant="accent" size="sm">
                              {project.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                            {project.summary}
                          </p>
                        </CardItem>

                        <CardItem translateZ={10} className="mt-auto">
                          <div className="flex flex-wrap gap-1.5">
                            {(project.techStack ?? []).slice(0, 3).map((tech, i) => (
                              <Badge key={i} size="sm">
                                {tech}
                              </Badge>
                            ))}
                            {(project.techStack ?? []).length > 3 && (
                              <Badge size="sm">+{(project.techStack ?? []).length - 3}</Badge>
                            )}
                          </div>
                        </CardItem>
                      </Card>
                    </div>
                  </a>
                </ThreeDCard>
              </BlurFade>
            );
          })}
        </div>

        {}
        <BlurFade direction="up" offset={24} delay={0.1} className="mt-16">
          <a href="/projects">
            <Button variant="primary" size="md" className="min-w-[200px] group">
              View All Projects
              <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </a>
        </BlurFade>
      </div>
    </section>
  );
}
