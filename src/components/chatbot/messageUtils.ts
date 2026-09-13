import type { Message } from './types';

export function getLastAssistantMessageId(messages: Message[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'assistant') {
      return messages[index].id;
    }
  }

  return null;
}
