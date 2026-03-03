import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import SEO from '@/components/SEO/SEO';
import ChatLayout from '@/components/chat/ChatLayout';

const ChatPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-stone-50 px-4 text-center">
        <SEO title="Community Chat" noindex />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <MessageSquare className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Join the Community</h1>
          <p className="text-sm text-gray-500">Sign in to chat with other collectors.</p>
        </div>
        <Link
          to="/login"
          state={{ from: { pathname: '/chat' } }}
          className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-500 active:scale-[0.98] transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO title="Community Chat" noindex />
      <ChatLayout />
    </>
  );
};

export default ChatPage;
