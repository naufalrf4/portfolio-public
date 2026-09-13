import { Activity } from 'lucide-react';
import { useLiveCursorPresence } from '@/components/home/useLiveCursorPresence';
import { useAstroPathname } from '@/lib/useAstroPathname';
import { cn } from '@/lib/utils';

interface PresenceChipProps {
  currentPath: string;
  socketUrl: string;
}

export function PresenceChip({ currentPath, socketUrl }: PresenceChipProps) {
  const pathname = useAstroPathname(currentPath);
  const { status, totalParticipants } = useLiveCursorPresence(currentPath, socketUrl);

  return (
    <div className="inline-flex items-center gap-2 md:hidden">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'connected' ? 'bg-teal shadow-[0_0_12px_var(--teal)]' :
          status === 'connecting' ? 'bg-amber shadow-[0_0_10px_var(--amber)]' :
          'bg-text-tertiary shadow-none'
        )}
      />
      <Activity size={11} className="text-teal" />
      <span className="font-mono text-xs font-semibold">{totalParticipants} Online</span>
    </div>
  );
}
