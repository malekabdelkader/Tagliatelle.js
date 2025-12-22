/**
 * 🍝 Posts Data Store
 * 
 * Shared data between post routes.
 * In a real app, this would be a database.
 */

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

export const posts: Post[] = [
  {
    id: '1',
    title: 'Welcome to Tagliatelle',
    content: 'The most delicious backend framework ever made.',
    author: 'Chef de Code',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'File-Based Routing is Here!',
    content: 'Just like Next.js, but for your API. Bellissimo!',
    author: 'The Pasta Architect',
    createdAt: new Date()
  }
];

