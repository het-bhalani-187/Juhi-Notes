export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export type Permission = 'read' | 'write' | 'owner';

export interface SharedUser {
  userId: string;
  permission: Permission;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
  sharedWith: SharedUser[];
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
  value?: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
}
