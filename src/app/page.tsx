import ChatWindow from '@/components/ChatWindow';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat - DesireFinder',
  description: 'AI-powered shopping assistant that helps you discover products based on your needs and preferences.',
};

const Home = () => {
  return <ChatWindow />;
};

export default Home;
