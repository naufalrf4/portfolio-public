import type { FC } from 'react';
import { Badge } from '../shared/Badge';
import { BlurFade } from '@/components/ui';
import type { Skill } from '../../types';

interface SkillBadgesProps {
  skills?: Skill[];
}

export const SkillBadges: FC<SkillBadgesProps> = ({ skills }) => {
  if (!skills || skills.length === 0) {
    return null;
  }

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const categories = Object.keys(groupedSkills).sort();

  return (
    <div className="space-y-6">
      {categories.map((category, catIndex) => (
        <BlurFade key={category} delay={catIndex * 0.08}>
          <h4 className="text-sm font-semibold font-mono text-muted-foreground uppercase tracking-wider mb-3">
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {groupedSkills[category].map((skill, index) => (
              <Badge key={`${category}-${skill.name}-${index}`} size="md" variant="default">
                {skill.name}
              </Badge>
            ))}
          </div>
        </BlurFade>
      ))}
    </div>
  );
};
