import { useMemo, useState, type FC } from 'react';
import { Card } from '../shared/Card';
import { Calendar, Briefcase, GraduationCap, Award, Users, MapPin, Building2 } from 'lucide-react';
import { BlurFade } from '@/components/ui';
import type { Experience } from '../../types';

interface ExperienceTabsProps {
  experience?: Experience[];
}

const tabConfig = [
  { type: 'work', label: 'Experience', icon: Briefcase },
  { type: 'education', label: 'Education', icon: GraduationCap },
  { type: 'certification', label: 'Certifications', icon: Award },
  { type: 'organizational', label: 'Organizational', icon: Users },
] as const;

function normalizeType(type: string): string {
  const normalized = type.toLowerCase();
  if (normalized === 'certifications') return 'certification';
  return normalized;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

function formatExperienceDateValue(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!isoMatch) {
    return trimmed;
  }

  const [, year, month, day] = isoMatch;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day ?? '1'));

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function formatExperienceRange(experience: Experience): string {
  const start = formatExperienceDateValue(experience.startDate);
  const end = experience.endDate ? formatExperienceDateValue(experience.endDate) : 'Present';

  if (!start) {
    return end;
  }

  if (!experience.endDate && !/^\d{4}-\d{2}/.test(experience.startDate)) {
    return start;
  }

  return `${start} - ${end}`;
}

function sortExperience(items: Experience[]): Experience[] {
  return [...items].sort((left, right) => right.startDate.localeCompare(left.startDate));
}

function ExperienceLogoPlaceholder() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated p-2 border border-line">
      <Building2 className="h-6 w-6 text-primary/70" />
    </div>
  );
}

export const ExperienceTabs: FC<ExperienceTabsProps> = ({ experience }) => {
  const items = useMemo(() => sortExperience(experience ?? []), [experience]);
  const availableTabs = useMemo(
    () => tabConfig.filter((tab) => items.some((item) => normalizeType(item.type) === tab.type)),
    [items]
  );
  const [activeTab, setActiveTab] = useState<string>(availableTabs[0]?.type ?? 'work');

  const filteredExperience = items.filter((item) => normalizeType(item.type) === activeTab);

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="sticky top-20 z-30 mb-8 rounded-xl border border-line bg-bg-elevated/90 p-1.5 backdrop-blur-xl">
        <div className="flex flex-wrap gap-2">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.type;

            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-[var(--teal-soft)] text-teal border border-teal/30'
                    : 'text-text-secondary border border-transparent hover:text-teal hover:bg-bg-card'
                )}
                aria-pressed={isActive}
                aria-label={`Show ${tab.label} entries`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="absolute bottom-0 left-4 top-0 w-[3px] rounded-full bg-[linear-gradient(180deg,var(--teal-soft)_0%,var(--teal)_50%,var(--teal-soft)_100%)]" />

        <div className="space-y-6">
          {filteredExperience.map((exp, index) => (
            <BlurFade
              key={`${exp.type}-${exp.title}-${index}`}
              delay={index * 0.08}
              className="relative pl-10"
            >
              <div className="absolute left-[5px] top-6 flex h-[22px] w-[22px] items-center justify-center rounded-full border border-teal/40 bg-[var(--teal-soft)] shadow-[0_0_12px_var(--teal-glow)]">
                <div className="h-2.5 w-2.5 rounded-full bg-teal shadow-[0_0_8px_var(--teal-glow)]" />
              </div>

              <Card className="p-5 md:p-6 transition-colors duration-300 hover:border-line-hover">
                <div className="mb-4 flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {exp.logoUrl ? (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-bg-elevated p-2 border border-line">
                        <img
                          src={exp.logoUrl}
                          alt={`${exp.organization} logo`}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="shrink-0">
                        <ExperienceLogoPlaceholder />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-bold text-foreground break-words">{exp.title}</h4>
                      <p className="font-medium text-primary break-words">{exp.organization}</p>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col items-start gap-2 text-sm text-muted-foreground md:items-end">
                    <div className="flex min-w-0 max-w-full items-center gap-1">
                      <Calendar size={14} className="shrink-0" />
                      <span className="break-words">{formatExperienceRange(exp)}</span>
                    </div>
                    {exp.location ? (
                      <div className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-primary/5 px-3 py-1 text-xs text-primary">
                        <MapPin size={12} className="shrink-0" />
                        <span className="break-words">{exp.location}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {exp.description ? (
                  <p className="mb-4 whitespace-pre-line text-muted-foreground">
                    {exp.description}
                  </p>
                ) : null}

                {exp.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill) => (
                      <span
                        key={`${exp.title}-${skill}`}
                        className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary border border-line"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Card>
            </BlurFade>
          ))}
        </div>

        {filteredExperience.length === 0 ? (
          <div className="pl-10">
            <Card className="p-6 text-center text-muted-foreground">
              No {tabConfig.find((tab) => tab.type === activeTab)?.label.toLowerCase()} entries to
              display.
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};
