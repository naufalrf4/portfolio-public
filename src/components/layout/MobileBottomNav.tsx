import { cn } from '../../lib/utils';
import { useState } from 'react';
import {
  Home,
  User,
  FolderKanban,
  FileText,
  Mail,
  MoreHorizontal,
  X,
  ExternalLink,
} from 'lucide-react';
import { OTHER_LINKS } from '../../lib/constants';
import { useAstroPathname } from '../../lib/useAstroPathname';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: User },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/publications', label: 'Publication', icon: FileText },
  { href: '/contact', label: 'Contact', icon: Mail },
];

interface MobileBottomNavProps {
  currentPath: string;
}

export function MobileBottomNav({ currentPath }: MobileBottomNavProps) {
  const pathname = useAstroPathname(currentPath);
  const [otherOpen, setOtherOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {otherOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOtherOpen(false)} data-analytics-button data-entity-type="mobile_nav_overlay" data-entity-id="other-links-overlay" data-entity-label="Close other links overlay">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            className="absolute bottom-24 right-4 w-56 py-3 rounded-xl border border-line bg-bg-card shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pb-2 mb-2 border-b border-line">
              <span className="text-sm font-semibold text-text-primary">Other Links</span>
              <button
                onClick={() => setOtherOpen(false)}
                data-analytics-button
                data-entity-type="mobile_nav_close"
                data-entity-id="other-links-menu"
                data-entity-label="Close other links menu"
                className="p-1 rounded-lg text-text-secondary hover:text-teal"
              >
                <X size={18} />
              </button>
            </div>

            {OTHER_LINKS.map((link) => {
              const Icon = link.icon;
              const isExternal = link.external;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:text-teal hover:bg-bg-elevated transition-colors"
                  onClick={() => setOtherOpen(false)}
                  data-entity-type={link.external ? 'mobile_nav_external' : 'mobile_nav_internal'}
                  data-entity-id={link.label}
                  data-entity-label={link.label}
                  data-entity-url={link.href}
                >
                  <Icon size={20} />
                  <span className="flex-1">{link.label}</span>
                  {link.external && <ExternalLink size={14} className="text-text-tertiary" />}
                </a>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-4 safe-area-pb">
        <div className="flex items-center justify-around px-1 py-2 rounded-xl border border-line bg-bg-card/95 backdrop-blur-md shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl transition-all duration-200',
                  active
                    ? 'text-teal bg-[var(--teal-soft)]'
                    : 'text-text-secondary hover:text-teal'
                )}
                aria-label={item.label}
                data-entity-type="mobile_nav_link"
                data-entity-id={item.href}
                data-entity-label={item.label}
                data-entity-url={item.href}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </a>
            );
          })}

          <button
            onClick={() => setOtherOpen(!otherOpen)}
            data-analytics-button
            data-entity-type="mobile_nav_other_toggle"
            data-entity-id="other-links-toggle"
            data-entity-label={otherOpen ? 'Close other links' : 'Open other links'}
            className={cn(
              'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl transition-all duration-200',
              otherOpen
                ? 'text-teal bg-[var(--teal-soft)]'
                : 'text-text-secondary hover:text-teal'
            )}
            aria-label="Other links"
          >
            <MoreHorizontal size={20} strokeWidth={otherOpen ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 font-medium">Other</span>
          </button>
        </div>
      </nav>
    </>
  );
}
