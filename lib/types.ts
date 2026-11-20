export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  sexualOrientation: string;
  interestedIn: string[];
  bio: string;
  address: string;
  education?: string;
  profession?: string;
  company?: string;
  photos: string[];
  interests: string[];
  verified?: boolean;
}

export interface MatchItem {
  id: string;
  matchedAt: string;
  user: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    profession?: string;
    address: string;
    verified?: boolean;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface LikeNotification {
  id: string;
  actorId: string;
  actorName: string;
  actorPhoto: string;
  type: "LIKE_RECEIVED" | "MUTUAL_MATCH";
  createdAt: string;
  read: boolean;
  matchId?: string;
}
