import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ProjectCard } from './ProjectCard';
import type { Project } from '@/types';

interface ProjectsGridProps {
  projects?: Project[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const items = projects ?? [];
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = new Set(items.map((p) => p.category));
    return ['All', ...Array.from(cats).sort()];
  }, [items]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((p) => p.category === activeCategory);
  }, [items, activeCategory]);

  const projectCount = filteredProjects.length;

  return (
    <div className="animate-fade-in">
      <div className="sticky top-20 z-30 mb-8 -mx-2 rounded-xl border border-line bg-bg-elevated/90 px-2 py-2 backdrop-blur-xl">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            const count =
              category === 'All'
                ? items.length
                : items.filter((p) => p.category === category).length;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize flex items-center',
                  'focus:outline-none focus:ring-2 focus:ring-teal/40 focus:ring-offset-0',
                  isActive
                    ? 'bg-[var(--teal-soft)] text-teal border border-teal/30'
                    : 'text-text-secondary border border-transparent hover:text-teal hover:bg-bg-card'
                )}
              >
                {category}
                <span
                  className={cn(
                    'ml-2 text-xs px-2 py-0.5 rounded-full',
                    isActive ? 'bg-[var(--teal-soft)] text-teal' : 'bg-bg-card text-text-secondary'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {projectCount === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No projects found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="stagger-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
