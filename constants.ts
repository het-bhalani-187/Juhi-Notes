import { User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Alex Sterling',
    avatar: 'https://picsum.photos/id/64/100/100',
    email: 'alex@juhi.app'
  },
  {
    id: 'user_2',
    name: 'Jordan Lee',
    avatar: 'https://picsum.photos/id/91/100/100',
    email: 'jordan@juhi.app'
  },
  {
    id: 'user_3',
    name: 'Casey Chen',
    avatar: 'https://picsum.photos/id/103/100/100',
    email: 'casey@juhi.app'
  }
];

export const INITIAL_NOTE_CONTENT = `Welcome to Juhi!

This is a collaborative space for you and your friends. 
- Share notes with write permissions.
- Switch users to simulate collaboration.
- Use the "Mind Map" tab to visualize your ideas.
- Ask Gemini to analyze or expand your thoughts.
- Hover over notes in the sidebar to delete them.

Start typing to create something beautiful...`;