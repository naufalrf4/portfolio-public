import { Fragment, useState, type ReactNode } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type JsonNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JsonNode[];
  marks?: Array<{
    type?: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
};

interface ProjectArticleProps {
  content?: string | null;
  className?: string;
}

interface TiptapSection {
  id: string;
  title: string;
  kind: 'tiptap';
  level: number;
  hasHeading: boolean;
  nodes: JsonNode[];
}

interface MarkdownSection {
  id: string;
  title: string;
  kind: 'markdown';
  level: number;
  hasHeading: boolean;
  body: string;
}

type ArticleSection = TiptapSection | MarkdownSection;

const ARTICLE_STYLES = {
  article: 'max-w-none text-text-secondary',
  h1: 'font-display text-3xl md:text-4xl font-bold tracking-tight text-text-primary mt-12 mb-6 first:mt-0',
  h2: 'font-display text-2xl md:text-[2rem] font-bold tracking-tight text-text-primary mt-12 mb-5 first:mt-0',
  h3: 'font-display text-xl md:text-2xl font-semibold text-text-primary mt-10 mb-4',
  h4: 'text-lg md:text-xl font-semibold text-text-primary mt-8 mb-3',
  p: 'text-[1.02rem] md:text-[1.08rem] leading-8 text-text-secondary mb-5',
  ul: 'mb-6 ml-5 list-disc space-y-3 text-[1.02rem] md:text-[1.08rem] leading-8 text-text-secondary',
  ol: 'mb-6 ml-5 list-decimal space-y-3 text-[1.02rem] md:text-[1.08rem] leading-8 text-text-secondary',
  li: 'pl-2',
  blockquote:
    'my-8 border-l-4 border-teal/70 bg-bg-card/60 pl-5 pr-4 py-4 italic text-text-secondary border border-line rounded-r-[22px]',
  pre: 'my-8 overflow-x-auto rounded-xl bg-bg-elevated p-5 text-sm leading-7 text-text-primary border border-line',
  code: 'rounded-md bg-bg-elevated px-1.5 py-0.5 text-[0.9em] text-teal break-all',
  a: 'font-medium text-teal underline decoration-teal/30 underline-offset-4 transition-colors duration-200 hover:brightness-110 break-words',
  hr: 'my-10 border-0 h-px bg-gradient-to-r from-transparent via-[var(--border-hover)] to-transparent',
  strong: 'font-semibold text-text-primary',
  em: 'italic text-text-secondary',
  img: 'my-8 w-full rounded-xl object-cover border border-line',
};

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function isSafeUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  if (url.startsWith('/') || url.startsWith('#')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

function isSafeImageUrl(url: string): boolean {
  if (url.startsWith('data:image/')) {
    return true;
  }

  return isSafeUrl(url);
}

function extractLeadingJsonDocument(value: string): { json: string; rest: string | null } | null {
  const input = value.trim();
  if (!input.startsWith('{')) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        const json = input.slice(0, index + 1);
        const rest = input.slice(index + 1).trim();
        return { json, rest: rest || null };
      }
    }
  }

  return null;
}

function parseJsonSafely(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getNormalizedContent(content?: string | null): {
  markdown: string | null;
  tiptap: JsonNode | null;
} {
  if (!content || !content.trim()) {
    return { markdown: null, tiptap: null };
  }

  const hybridContent = extractLeadingJsonDocument(content);
  if (hybridContent) {
    const parsed = parseJsonSafely(hybridContent.json);
    if (parsed && typeof parsed === 'object' && 'type' in parsed && parsed.type === 'doc') {
      return {
        markdown: hybridContent.rest,
        tiptap: parsed as JsonNode,
      };
    }
  }

  let current: unknown = content.trim();

  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== 'string') {
      break;
    }

    const candidate = current.trim();
    if (!candidate.startsWith('{') && !candidate.startsWith('[')) {
      return { markdown: current, tiptap: null };
    }

    try {
      current = JSON.parse(candidate);
    } catch {
      return { markdown: candidate, tiptap: null };
    }
  }

  if (typeof current === 'string') {
    return { markdown: current, tiptap: null };
  }

  if (current && typeof current === 'object' && 'type' in current && current.type === 'doc') {
    return { markdown: null, tiptap: current as JsonNode };
  }

  return {
    markdown: typeof content === 'string' ? content : JSON.stringify(current, null, 2),
    tiptap: null,
  };
}

// Slugger used only to keep section keys/ids unique within a single render pass.
function createSlugger() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base =
      text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .trim();
}

function getPlainNodeText(node: JsonNode): string {
  if (node.type === 'text') {
    return node.text ?? '';
  }
  return (node.content ?? []).map(getPlainNodeText).join('');
}

// Splits the top-level tiptap nodes into sections at the shallowest heading level
// found in the document (e.g. all H2s if the doc has no H1s). Content before the
// first boundary heading becomes an "Overview" section.
function buildTiptapSections(doc: JsonNode): ArticleSection[] {
  const topNodes = doc.content ?? [];
  const headingLevels = topNodes
    .filter((node) => node.type === 'heading')
    .map((node) => (typeof node.attrs?.level === 'number' ? node.attrs.level : 2));

  if (headingLevels.length === 0) {
    return topNodes.length > 0
      ? [{ id: 'content', title: 'Overview', kind: 'tiptap', level: 2, hasHeading: false, nodes: topNodes }]
      : [];
  }

  const baseLevel = Math.min(...headingLevels);
  const slug = createSlugger();
  const sections: TiptapSection[] = [];
  const intro: JsonNode[] = [];
  let current: TiptapSection | null = null;

  for (const node of topNodes) {
    const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
    if (node.type === 'heading' && level === baseLevel) {
      if (current) sections.push(current);
      const title = getPlainNodeText(node).trim() || 'Section';
      current = { id: slug(title), title, kind: 'tiptap', level: baseLevel, hasHeading: true, nodes: [] };
      continue;
    }
    (current ? current.nodes : intro).push(node);
  }
  if (current) sections.push(current);

  if (intro.length > 0) {
    sections.unshift({ id: slug('overview'), title: 'Overview', kind: 'tiptap', level: baseLevel, hasHeading: false, nodes: intro });
  }

  return sections;
}

// Same idea as buildTiptapSections but working over raw markdown lines, respecting
// fenced code blocks so a `#` inside a code sample never gets treated as a heading.
function buildMarkdownSections(markdown: string): ArticleSection[] {
  const lines = markdown.split('\n');
  let inFence = false;
  const levels: number[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{1,4})\s+/.exec(line);
    if (match) levels.push(match[1].length);
  }

  if (levels.length === 0) {
    return markdown.trim()
      ? [{ id: 'content', title: 'Overview', kind: 'markdown', level: 2, hasHeading: false, body: markdown }]
      : [];
  }

  const baseLevel = Math.min(...levels);
  const slug = createSlugger();
  const sections: MarkdownSection[] = [];
  const introLines: string[] = [];
  let currentTitle: string | null = null;
  let currentLines: string[] = [];
  inFence = false;

  const flushCurrent = () => {
    if (currentTitle !== null) {
      sections.push({
        id: slug(currentTitle),
        title: currentTitle,
        kind: 'markdown',
        level: baseLevel,
        hasHeading: true,
        body: currentLines.join('\n'),
      });
    }
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    const isFenceMarker = /^(```|~~~)/.test(trimmed);
    if (isFenceMarker) {
      inFence = !inFence;
      (currentTitle !== null ? currentLines : introLines).push(raw);
      continue;
    }

    if (!inFence) {
      const match = /^(#{1,4})\s+(.+?)\s*#*$/.exec(trimmed);
      if (match && match[1].length === baseLevel) {
        flushCurrent();
        currentTitle = stripInlineMarkdown(match[2]) || 'Section';
        currentLines = [];
        continue;
      }
    }

    (currentTitle !== null ? currentLines : introLines).push(raw);
  }
  flushCurrent();

  const introBody = introLines.join('\n').trim();
  if (introBody) {
    sections.unshift({
      id: slug('overview'),
      title: 'Overview',
      kind: 'markdown',
      level: baseLevel,
      hasHeading: false,
      body: introBody,
    });
  }

  return sections;
}

function SectionTabs({
  sections,
  active,
  showAll,
  onSelect,
  onToggleShowAll,
}: {
  sections: ArticleSection[];
  active: number;
  showAll: boolean;
  onSelect: (index: number) => void;
  onToggleShowAll: () => void;
}) {
  if (sections.length < 2) return null;

  return (
    <div className="mb-10 flex flex-wrap items-center gap-3">
      <nav
        aria-label="Sections in this article"
        className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
      >
        {sections.map((section, index) => {
          const isActive = !showAll && index === active;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-current={isActive}
              className={cn(
                'shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors duration-200',
                isActive
                  ? 'border-teal bg-teal/10 font-bold text-teal'
                  : 'border-line bg-bg-card text-text-secondary hover:border-teal/50 hover:text-teal'
              )}
            >
              {section.title}
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onToggleShowAll}
        className={cn(
          'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors duration-200',
          showAll
            ? 'border-teal bg-teal/10 font-bold text-teal'
            : 'border-line bg-bg-card text-text-secondary hover:border-teal/50 hover:text-teal'
        )}
      >
        {showAll ? 'Collapse' : 'Show all'}
      </button>
    </div>
  );
}

function renderTextWithMarks(node: JsonNode, key: string): ReactNode {
  let rendered: ReactNode = node.text ?? '';

  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') {
      rendered = <strong className={ARTICLE_STYLES.strong}>{rendered}</strong>;
      continue;
    }

    if (mark.type === 'italic') {
      rendered = <em className={ARTICLE_STYLES.em}>{rendered}</em>;
      continue;
    }

    if (mark.type === 'code') {
      rendered = <code className={ARTICLE_STYLES.code}>{rendered}</code>;
      continue;
    }

    if (mark.type === 'link') {
      const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : '';
      rendered = isSafeUrl(href) ? (
        <a className={ARTICLE_STYLES.a} href={href} target="_blank" rel="noreferrer noopener">
          {rendered}
        </a>
      ) : (
        rendered
      );
    }
  }

  return <Fragment key={key}>{rendered}</Fragment>;
}

function renderChildren(nodes: JsonNode[] | undefined, parentKey: string): ReactNode[] {
  return (nodes ?? [])
    .map((node, index) => renderNode(node, `${parentKey}-${index}`))
    .filter(Boolean);
}

function renderNode(node: JsonNode, key: string): ReactNode {
  if (node.type === 'text') {
    return renderTextWithMarks(node, key);
  }

  if (node.type === 'hardBreak') {
    return <br key={key} />;
  }

  const children = renderChildren(node.content, key);

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className={ARTICLE_STYLES.p}>
          {children}
        </p>
      );
    case 'heading': {
      const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
      if (level === 1) {
        // Article body can't emit a second page-level H1: the project title
        // above already owns it, so author-authored H1s demote to H2.
        return (
          <h2 key={key} className={ARTICLE_STYLES.h2}>
            {children}
          </h2>
        );
      }
      if (level === 2) {
        return (
          <h2 key={key} className={ARTICLE_STYLES.h2}>
            {children}
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3 key={key} className={ARTICLE_STYLES.h3}>
            {children}
          </h3>
        );
      }
      return (
        <h4 key={key} className={ARTICLE_STYLES.h4}>
          {children}
        </h4>
      );
    }
    case 'bulletList':
      return (
        <ul key={key} className={ARTICLE_STYLES.ul}>
          {children}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key} className={ARTICLE_STYLES.ol}>
          {children}
        </ol>
      );
    case 'listItem':
      return (
        <li key={key} className={ARTICLE_STYLES.li}>
          {children}
        </li>
      );
    case 'blockquote':
      return (
        <blockquote key={key} className={ARTICLE_STYLES.blockquote}>
          {children}
        </blockquote>
      );
    case 'codeBlock': {
      const codeText = (node.content ?? [])
        .map((child) => (typeof child.text === 'string' ? child.text : ''))
        .join('');
      return (
        <pre key={key} className={ARTICLE_STYLES.pre}>
          <code>{codeText}</code>
        </pre>
      );
    }
    case 'image': {
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
      if (!isSafeImageUrl(src)) {
        return null;
      }
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      const title = typeof node.attrs?.title === 'string' ? node.attrs.title : alt;

      return (
        <img
          key={key}
          src={src}
          alt={alt || 'Project illustration'}
          title={title || undefined}
          className={ARTICLE_STYLES.img}
          loading="lazy"
        />
      );
    }
    case 'horizontalRule':
      return <hr key={key} className={ARTICLE_STYLES.hr} />;
    case 'doc':
      return <Fragment key={key}>{children}</Fragment>;
    default:
      return children.length > 0 ? <Fragment key={key}>{children}</Fragment> : null;
  }
}

function MarkdownArticle({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      urlTransform={(url) => (isSafeUrl(url) ? url : '')}
      components={{
        h1: ({ children }) => <h2 className={ARTICLE_STYLES.h2}>{children}</h2>,
        h2: ({ children }) => <h2 className={ARTICLE_STYLES.h2}>{children}</h2>,
        h3: ({ children }) => <h3 className={ARTICLE_STYLES.h3}>{children}</h3>,
        h4: ({ children }) => <h4 className={ARTICLE_STYLES.h4}>{children}</h4>,
        p: ({ children }) => <p className={ARTICLE_STYLES.p}>{children}</p>,
        ul: ({ children }) => <ul className={ARTICLE_STYLES.ul}>{children}</ul>,
        ol: ({ children }) => <ol className={ARTICLE_STYLES.ol}>{children}</ol>,
        li: ({ children }) => <li className={ARTICLE_STYLES.li}>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className={ARTICLE_STYLES.blockquote}>{children}</blockquote>
        ),
        pre: ({ children }) => <pre className={ARTICLE_STYLES.pre}>{children}</pre>,
        code: ({ className, children }) => {
          if (className) {
            return <code className={cn(className, 'text-inherit')}>{children}</code>;
          }

          return <code className={ARTICLE_STYLES.code}>{children}</code>;
        },
        a: ({ href, children }) => {
          if (!href || !isSafeUrl(href)) {
            return <span>{children}</span>;
          }

          const external = href.startsWith('http');
          return (
            <a
              className={ARTICLE_STYLES.a}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer noopener' : undefined}
            >
              {children}
            </a>
          );
        },
        hr: () => <hr className={ARTICLE_STYLES.hr} />,
        strong: ({ children }) => <strong className={ARTICLE_STYLES.strong}>{children}</strong>,
        em: ({ children }) => <em className={ARTICLE_STYLES.em}>{children}</em>,
        img: ({ src, alt }) => {
          if (!src || !isSafeImageUrl(src)) {
            return null;
          }

          return (
            <img
              src={src}
              alt={alt || 'Project illustration'}
              className={ARTICLE_STYLES.img}
              loading="lazy"
            />
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}

function makeHeadingNode(title: string, level: number): JsonNode {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text: title }] };
}

function buildTiptapShowAllNodes(sections: TiptapSection[]): JsonNode[] {
  const out: JsonNode[] = [];
  for (const section of sections) {
    if (section.hasHeading) {
      out.push(makeHeadingNode(section.title, section.level));
    }
    out.push(...section.nodes);
  }
  return out;
}

function buildMarkdownShowAll(sections: MarkdownSection[]): string {
  return sections
    .map((section) =>
      section.hasHeading ? `${'#'.repeat(section.level)} ${section.title}\n\n${section.body}` : section.body
    )
    .join('\n\n');
}

export function ProjectArticle({ content, className }: ProjectArticleProps) {
  const normalized = getNormalizedContent(content);
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(false);

  if (!normalized.markdown && !normalized.tiptap) {
    return null;
  }

  const tiptapSections = normalized.tiptap ? (buildTiptapSections(normalized.tiptap) as TiptapSection[]) : [];
  const markdownSections = normalized.markdown ? (buildMarkdownSections(normalized.markdown) as MarkdownSection[]) : [];
  const sections: ArticleSection[] = [...tiptapSections, ...markdownSections];

  if (sections.length === 0) {
    return null;
  }

  const activeIndex = Math.min(active, sections.length - 1);

  return (
    <article className={cn(ARTICLE_STYLES.article, className)}>
      <SectionTabs
        sections={sections}
        active={activeIndex}
        showAll={showAll}
        onSelect={(index) => {
          setActive(index);
          setShowAll(false);
        }}
        onToggleShowAll={() => setShowAll((value) => !value)}
      />
      {/*
        Every section is rendered into the DOM, not just the active one, and the
        inactive ones are hidden with CSS. Rendering only the active tab meant
        crawlers and answer engines received a single section - about a fifth of
        the writing - because the rest never reached the served HTML. Visually
        this is unchanged: exactly one section is visible at a time.
      */}
      {showAll
        ? sections.map((section) => (
            <div key={`all-${section.id}`}>
              {section.kind === 'tiptap' ? (
                renderChildren(buildTiptapShowAllNodes([section]), `article-all-${section.id}`)
              ) : (
                <MarkdownArticle content={buildMarkdownShowAll([section])} />
              )}
            </div>
          ))
        : sections.map((section, index) => (
            <div key={`section-${section.id}`} hidden={index !== activeIndex}>
              {section.kind === 'tiptap' ? (
                renderChildren(section.nodes, `section-${section.id}`)
              ) : (
                <MarkdownArticle content={section.body} />
              )}
            </div>
          ))}
    </article>
  );
}
