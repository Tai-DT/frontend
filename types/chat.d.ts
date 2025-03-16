export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  sessionId: string;
  userId?: string;
  timestamp: string;
  read: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'closed';
}

export interface Attachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  size?: number;
  previewUrl?: string;
}
