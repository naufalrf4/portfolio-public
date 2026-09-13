import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
  isStreaming?: boolean;
}

export function MarkdownMessage({
  content,
  isUser = false,
  isStreaming = false,
}: MarkdownMessageProps) {
  if (isUser) {
    return <div className="text-sm leading-relaxed text-bg whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none text-text-primary',
        'prose-a:text-teal prose-a:no-underline hover:prose-a:brightness-110',
        'prose-strong:text-text-primary prose-code:text-teal',
        isStreaming && 'animate-in fade-in duration-200'
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeSanitize,
            {
              ...defaultSchema,
              attributes: {
                ...defaultSchema.attributes,
                a: [...(defaultSchema.attributes?.a ?? []), ['target'], ['rel']],
              },
            },
          ],
        ]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer noopener" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && <span className="inline-block w-1 h-4 ml-0.5 bg-teal animate-pulse" />}
    </div>
  );
}
