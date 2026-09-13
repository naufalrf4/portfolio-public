import React from 'react';
import { BlogCard } from './BlogCard';
import { Card } from '../shared';
import type { BlogLink } from '@/types';
import { FileX } from 'lucide-react';

interface BlogsGridProps {
  blogs?: BlogLink[];
}

function EmptyState() {
  return (
    <div className="w-full flex justify-center py-12">
      <Card className="max-w-md w-full p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4 border border-line">
          <FileX className="w-8 h-8 text-text-secondary" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">No articles found</h3>
        <p className="text-text-secondary">
          No articles are available at the moment. Check back later for new content!
        </p>
      </Card>
    </div>
  );
}

export function BlogsGrid({ blogs }: BlogsGridProps) {
  if (!blogs || blogs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
      {blogs.map((blog, index) => (
        <div key={blog.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
          <BlogCard blog={blog} />
        </div>
      ))}
    </div>
  );
}
