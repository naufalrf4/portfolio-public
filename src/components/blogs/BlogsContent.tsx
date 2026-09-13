import React, { useState, useMemo } from 'react';
import { BlogsGrid } from './BlogsGrid';
import { Card } from '../shared';
import type { BlogLink } from '@/types';

interface BlogsContentProps {
  initialBlogs?: BlogLink[];
}

export function BlogsContent({ initialBlogs }: BlogsContentProps) {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const blogs = initialBlogs || [];

  const sources = useMemo(() => {
    const uniqueSources = new Set(blogs.map((blog) => blog.source));
    return ['all', ...Array.from(uniqueSources).sort()];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    if (selectedSource === 'all') {
      return blogs;
    }
    return blogs.filter((blog) => blog.source === selectedSource);
  }, [blogs, selectedSource]);

  return (
    <div>
      {}
      {sources.length > 2 && (
        <div className="mb-8">
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-text-primary mr-2 flex items-center">
                Filter by platform:
              </span>
              {sources.map((source) => (
                <button
                  key={source}
                  onClick={() => setSelectedSource(source)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSource === source
                      ? 'bg-teal text-bg'
                      : 'bg-bg-elevated text-text-secondary border border-line '
                  }`}
                >
                  {source === 'all' ? 'All' : source}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      <BlogsGrid blogs={filteredBlogs} />
    </div>
  );
}
