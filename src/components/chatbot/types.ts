export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  suggestedActions?: SuggestedAction[];
  metadata?: ChatMetadata;
  pendingAction?: PendingAction;
}

export type SuggestedActionType = 'open_page' | 'open_link' | 'highlight_section';

export interface SuggestedAction {
  type: SuggestedActionType;
  target: string;
  label: string;
}

export interface ChatMetadata {
  workflow: string;
  intent: string;
  queryLanguage: string;
  answerLanguage: string;
  retrievalConfidence: number;
  abstained: boolean;
}

export interface BookingSlotOption {
  slotId: string;
  label: string;
  dateTimeIso: string;
}

export interface PendingAction {
  actionId: string;
  tool: string;
  description: string;
  missingFields: string[];
  slotOptions?: BookingSlotOption[];
}

export interface ChatRequest {
  sessionId?: string;
  message: string;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  sources: string[];
  suggestedActions?: SuggestedAction[];
  metadata?: ChatMetadata;
  pendingAction?: PendingAction;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}
