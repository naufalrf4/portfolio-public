import { IconCloud } from '@/components/ui/IconCloud';
import { NumberTicker } from '@/components/ui/NumberTicker';
import { BlurFade } from '@/components/ui/BlurFade';
import { BorderBeam } from '@/components/ui/BorderBeam';

type BadgeTone = 'accent' | 'neutral' | 'outline';

interface SkillGroup {
  readonly title: string;
  readonly description: string;
  readonly technologies: readonly { readonly label: string; readonly tone: BadgeTone }[];
}

const skillGroups: readonly SkillGroup[] = [
  {
    title: 'Frontend',
    description:
      'Interfaces built for speed and clarity, with type safety from the first component onward.',
    technologies: [
      { label: 'Next.js', tone: 'accent' },
      { label: 'React', tone: 'neutral' },
      { label: 'TypeScript', tone: 'accent' },
      { label: 'JavaScript', tone: 'outline' },
      { label: 'Tailwind CSS', tone: 'neutral' },
      { label: 'Vue.js', tone: 'outline' },
      { label: 'TanStack', tone: 'accent' },
    ],
  },
  {
    title: 'Backend',
    description:
      'APIs and services that stay predictable under load, in whichever language the job calls for.',
    technologies: [
      { label: 'Node.js', tone: 'accent' },
      { label: 'Express.js', tone: 'neutral' },
      { label: 'Python', tone: 'accent' },
      { label: 'Laravel', tone: 'outline' },
      { label: 'PHP', tone: 'neutral' },
      { label: 'Golang', tone: 'outline' },
    ],
  },
  {
    title: 'Database',
    description:
      'Schemas and query layers designed for the shape of the data, not just the shape of the ORM.',
    technologies: [
      { label: 'PostgreSQL', tone: 'accent' },
      { label: 'MySQL', tone: 'neutral' },
      { label: 'Supabase', tone: 'outline' },
      { label: 'Drizzle', tone: 'accent' },
      { label: 'Prisma', tone: 'neutral' },
      { label: 'VectorDB', tone: 'outline' },
      { label: 'TimescaleDB', tone: 'neutral' },
      { label: 'Alembic', tone: 'outline' },
    ],
  },
  {
    title: 'DevOps & Cloud',
    description:
      'Deployment, infrastructure, and the daily-driver toolchain that keeps systems running.',
    technologies: [
      { label: 'Docker', tone: 'accent' },
      { label: 'Bash', tone: 'neutral' },
      { label: 'AWS S3', tone: 'outline' },
      { label: 'Firebase', tone: 'neutral' },
      { label: 'CCNA', tone: 'outline' },
      { label: 'GCP', tone: 'accent' },
    ],
  },
  {
    title: 'Agentic AI',
    description:
      'LLM-driven automation: agent orchestration, retrieval pipelines, and AI-assisted workflows.',
    technologies: [
      { label: 'Claude Code', tone: 'accent' },
      { label: 'n8n', tone: 'neutral' },
      { label: 'OpenCode', tone: 'outline' },
      { label: 'Hermes Agent', tone: 'accent' },
      { label: 'Pi Agent Harness', tone: 'outline' },
    ],
  },
  {
    title: 'IoT & Hardware',
    description:
      'Connected devices and embedded systems bridging physical sensors with real-time software.',
    technologies: [
      { label: 'ESP32', tone: 'accent' },
      { label: 'IoT', tone: 'neutral' },
      { label: 'MQTT', tone: 'outline' },
      { label: 'Raspberry Pi 4', tone: 'accent' },
    ],
  },
  {
    title: 'Testing & Automation',
    description:
      'Coverage that catches regressions before a user does, across the browser and the backend.',
    technologies: [
      { label: 'Playwright', tone: 'accent' },
      { label: 'Jest', tone: 'neutral' },
      { label: 'Selenium', tone: 'outline' },
    ],
  },
  {
    title: 'Tools & Design',
    description:
      'The workflow layer around the code: version control, handoff, and quick visual iteration.',
    technologies: [
      { label: 'Git', tone: 'accent' },
      { label: 'Postman', tone: 'neutral' },
      { label: 'Figma', tone: 'outline' },
      { label: 'Canva', tone: 'neutral' },
      { label: 'Adobe', tone: 'outline' },
    ],
  },
  {
    title: 'Systems & Languages',
    description:
      'Lower-level work for when performance and memory safety actually matter to the outcome.',
    technologies: [
      { label: 'Rust', tone: 'accent' },
      { label: 'Tauri', tone: 'outline' },
    ],
  },
];

const badgeClass: Record<BadgeTone, string> = {
  accent:
    'rounded-full border border-teal/40 bg-teal/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-teal transition-colors hover:border-teal/70',
  neutral:
    'rounded-md border border-line bg-bg-elevated px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-text-secondary transition-colors hover:border-line-hover hover:text-text-primary',
  outline:
    'rounded-md border border-dashed border-line bg-transparent px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-text-tertiary transition-colors hover:border-line-hover hover:text-text-secondary',
};

const cloudIcons = [
  'https://cdn.simpleicons.org/nextdotjs/ffffff',
  'https://cdn.simpleicons.org/react',
  'https://cdn.simpleicons.org/typescript',
  'https://cdn.simpleicons.org/javascript',
  'https://cdn.simpleicons.org/tailwindcss',
  'https://cdn.simpleicons.org/vuedotjs',
  'https://cdn.simpleicons.org/tanstack',
  'https://cdn.simpleicons.org/nodedotjs',
  'https://cdn.simpleicons.org/express/ffffff',
  'https://cdn.simpleicons.org/python',
  'https://cdn.simpleicons.org/laravel',
  'https://cdn.simpleicons.org/php',
  'https://cdn.simpleicons.org/go',
  'https://cdn.simpleicons.org/postgresql',
  'https://cdn.simpleicons.org/mysql',
  'https://cdn.simpleicons.org/supabase',
  'https://cdn.simpleicons.org/drizzle',
  'https://cdn.simpleicons.org/prisma/ffffff',
  'https://cdn.simpleicons.org/timescale',
  'https://cdn.simpleicons.org/docker',
  'https://cdn.simpleicons.org/gnubash',
  'https://cdn.simpleicons.org/googlecloud',
  'https://cdn.simpleicons.org/firebase',
  'https://cdn.simpleicons.org/anthropic/ffffff',
  'https://cdn.simpleicons.org/n8n',
  'https://cdn.simpleicons.org/espressif',
  'https://cdn.simpleicons.org/raspberrypi',
  'https://cdn.simpleicons.org/mqtt',
  'https://cdn.simpleicons.org/jest',
  'https://cdn.simpleicons.org/selenium',
  'https://cdn.simpleicons.org/postman',
  'https://cdn.simpleicons.org/git',
  'https://cdn.simpleicons.org/figma',
  'https://cdn.simpleicons.org/rust',
  'https://cdn.simpleicons.org/tauri',
] as const;

export function TechnicalExpertise() {
  return (
    <section data-scene="circuit" className="relative w-full border-t border-teal/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:items-start lg:gap-8">
          {}
          <div className="flex flex-col gap-10">
            <BlurFade delay={0.1} inView>
              <div className="flex flex-col gap-5">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-teal">
                  01 / Domains & Stack
                </span>
                <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-6xl">
                  Technical Expertise
                </h2>
                <p className="max-w-md text-base leading-relaxed text-text-secondary">
                  I work across software, cloud, IoT, and AI, using one connected stack to bring them together.
                </p>
                <div className="flex items-baseline gap-3 font-mono text-xs uppercase tracking-widest text-text-tertiary">
                  <span className="text-3xl font-bold text-teal md:text-4xl">
                    0<NumberTicker value={skillGroups.length} />
                  </span>
                  <span>domains</span>
                  <span className="mx-2 inline-block h-px w-8 bg-line" />
                  <span className="text-3xl font-bold text-text-primary md:text-4xl">
                    <NumberTicker value={cloudIcons.length} />+
                  </span>
                  <span>stack depth</span>
                </div>
              </div>
            </BlurFade>

            <div className="flex flex-col gap-6 border-t border-line pt-8">
              {skillGroups.map((group, index) => (
                <BlurFade key={group.title} delay={0.15 + index * 0.1} inView>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-teal">
                        0{index + 1}
                      </span>
                      <h3 className="font-display text-lg font-bold text-text-primary">
                        {group.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-text-tertiary">{group.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.technologies.map((tech) => (
                        <span key={tech.label} className={badgeClass[tech.tone]}>
                          {tech.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>

          {}
          <BlurFade
            delay={0.3}
            inView
            className="flex w-full items-center justify-center lg:sticky lg:top-24 lg:justify-end"
          >
            <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-card p-4">
              <IconCloud size={400} images={[...cloudIcons]} />
              <BorderBeam size={140} duration={12} colorFrom="var(--teal)" colorTo="var(--bg-elevated)" />
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
