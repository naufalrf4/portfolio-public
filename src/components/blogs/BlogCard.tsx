import React from 'react';
import { Badge } from '../shared';
import { Calendar, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ThreeDCard, CardItem } from '@/components/ui';
import type { BlogLink } from '@/types';

interface BlogCardProps {
  blog: BlogLink;
}

export function BlogCard({ blog }: BlogCardProps) {
  const title = blog.title?.trim() || 'Untitled Article';
  const source = blog.source?.trim() || 'Unknown';
  const url = blog.url?.trim() || '#';

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full group">
      <ThreeDCard className="h-full">
        <div className="h-full flex flex-col bg-bg-card border border-line rounded-2xl p-6 transition-colors duration-300 hover:border-line-hover">
          <CardItem translateZ={30}>
            <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-line">
              {blog.imageUrl ? (
                <img
                  src={blog.imageUrl}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {blog.category && (
                <Badge variant="accent" size="sm">
                  {blog.category}
                </Badge>
              )}
              <Badge variant="default" size="sm">
                {source}
              </Badge>
              <div className="flex items-center text-sm text-text-secondary">
                <Calendar className="w-4 h-4 mr-1" />
                {blog.publishedAt ? formatDate(blog.publishedAt) : 'No date'}
              </div>
            </div>

            <h3 className="text-xl font-bold text-text-primary group-hover:text-teal transition-colors mb-2 line-clamp-2">
              {title}
            </h3>

            {blog.description && <p className="text-text-secondary line-clamp-2 mb-4">{blog.description}</p>}
          </CardItem>

          <CardItem translateZ={10}>
            <div className="flex items-center text-teal font-medium mt-auto">
              Read Article
              <ExternalLink className="ml-2 w-4 h-4" />
            </div>
          </CardItem>
        </div>
      </ThreeDCard>
    </a>
  );
}
