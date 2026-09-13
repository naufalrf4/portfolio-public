import { cn } from '@/lib/utils';
import { ArrowRight, Check, X, Loader2, CalendarClock } from 'lucide-react';
import type { Message } from './types';
import { MarkdownMessage } from './MarkdownMessage';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  isLastAssistantMessage?: boolean;
  onConfirmAction?: (messageId: string, confirm: boolean) => Promise<void>;
  isConfirming?: boolean;
  onSelectSlot?: (slotId: string) => Promise<void>;
  isSlotSelectionDisabled?: boolean;
}

export function MessageBubble({
  message,
  isStreaming = false,
  isLastAssistantMessage = false,
  onConfirmAction,
  isConfirming = false,
  onSelectSlot,
  isSlotSelectionDisabled = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const canShowSuggestedActions = !isUser && isLastAssistantMessage && !isStreaming;
  const suggestedActions = canShowSuggestedActions
    ? message.suggestedActions?.filter((action) => action.type !== 'highlight_section')
    : undefined;
  const pendingAction = message.pendingAction;

  const handleConfirm = async () => {
    if (isConfirming) return;
    if (onConfirmAction && pendingAction && pendingAction.missingFields.length === 0) {
      await onConfirmAction(message.id, true);
    }
  };

  const handleDecline = async () => {
    if (isConfirming) return;
    if (onConfirmAction && pendingAction) {
      await onConfirmAction(message.id, false);
    }
  };

  const handleSelectSlot = async (slotId: string) => {
    if (isSlotSelectionDisabled) return;
    if (onSelectSlot) {
      await onSelectSlot(slotId);
    }
  };

  const isBookingAction = pendingAction?.tool === 'create_booking';
  const isAwaitingSlotSelection = Boolean(
    pendingAction && pendingAction.missingFields.includes('slotId') && pendingAction.slotOptions?.length
  );

  return (
    <div
      className={cn(
        'flex w-full min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'min-w-0 max-w-[80%] lg:max-w-[65%] rounded-2xl px-4 py-3 break-words [overflow-wrap:anywhere]',
          isUser
            ? 'bg-teal text-bg rounded-br-md'
            : 'bg-bg-elevated border border-line text-text-primary rounded-bl-md'
        )}
      >
        <div className="min-w-0 flex-1">
          <MarkdownMessage content={message.content} isUser={isUser} isStreaming={isStreaming} />
        </div>

        {!isUser && pendingAction && (
          <div className="mt-3 rounded-xl border border-[var(--teal)]/40 bg-[var(--teal-soft)] p-3">
            <p className="text-sm font-medium text-[var(--teal)] mb-2">
              {pendingAction.description}
            </p>
            {isAwaitingSlotSelection && (
              <div className="flex flex-wrap gap-2 mb-2">
                {pendingAction.slotOptions?.map((slot) => (
                  <button
                    key={slot.slotId}
                    type="button"
                    onClick={() => handleSelectSlot(slot.slotId)}
                    disabled={isSlotSelectionDisabled}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--teal)]/40 bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--teal)] transition-all hover:-translate-y-0.5 hover:border-[var(--teal)]/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CalendarClock size={13} className="shrink-0" />
                    {slot.label}
                  </button>
                ))}
              </div>
            )}

            {pendingAction.missingFields.length > 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                Missing: {pendingAction.missingFields.join(', ')}
              </p>
            ) : (
              <div>
                {isBookingAction && (
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    Confirming creates a real booking and sends a confirmation email.
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--teal)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--teal)]/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isConfirming ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Confirm
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={isConfirming}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isConfirming ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isUser && suggestedActions && suggestedActions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedActions.map((action, index) => {
              return (
                <a
                  key={`${action.target}-${index}`}
                  href={action.target}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium',
                    'border border-teal/30 bg-[var(--teal-soft)] text-teal',
                    'transition-all hover:-translate-y-0.5 hover:border-teal/50'
                  )}
                >
                  <span>{action.label}</span>
                  <ArrowRight size={14} className="shrink-0" />
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
