import { Badge } from '../shared/Badge';
import { ThreeDCard, CardItem } from '@/components/ui';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const title = project.title?.trim() || 'Untitled Project';
  const techStack = project.techStack ?? [];
  const thumbnailUrl = project.imageUrl || project.images?.[0]?.url;

  return (
    <a href={`/projects/${project.slug}`} className="block h-full group no-underline" data-entity-type="project_card" data-entity-id={project.slug} data-entity-label={title} data-entity-url={`/projects/${project.slug}`}>
      <ThreeDCard className="h-full">
        <div className="h-full bg-bg-card border border-line rounded-2xl p-6 transition-colors duration-300 hover:border-line-hover">
          <CardItem translateZ={30}>
            <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-line">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={project.images?.[0]?.alt || title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
                  <span className="text-4xl text-white font-bold">{title.charAt(0)}</span>
                </div>
              )}
            </div>
          </CardItem>

          <CardItem translateZ={20}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-xl font-bold text-text-primary group-hover:text-teal transition-colors">
                {title}
              </h3>
              <Badge variant="accent" size="sm">
                {project.category}
              </Badge>
            </div>
          </CardItem>

          <CardItem translateZ={10}>
            <p className="text-text-secondary mb-4 line-clamp-2">{project.summary}</p>

            <div className="flex flex-wrap gap-2">
              {techStack.slice(0, 4).map((tech, index) => (
                <Badge key={index} size="sm">
                  {tech}
                </Badge>
              ))}
              {techStack.length > 4 && <Badge size="sm">+{techStack.length - 4}</Badge>}
            </div>
          </CardItem>
        </div>
      </ThreeDCard>
    </a>
  );
}
