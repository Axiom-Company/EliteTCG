import { useState } from 'react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="bg-gray-50 border-t border-gray-100 py-20 md:py-24">
      <div className="container max-w-xl mx-auto px-6 text-center">

        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4">Newsletter</p>

        <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-3 leading-tight">
          Stay Ahead of Every Release
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-sm mx-auto">
          New sets, restocks and exclusive deals — delivered straight to your inbox before anyone else.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 text-white text-sm font-medium">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            You're on the list
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 h-11 rounded-full border border-gray-200 bg-white px-5 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors shadow-sm"
            />
            <button
              type="submit"
              className="h-11 px-7 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors shrink-0 shadow-sm"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-xs text-gray-300 mt-5">No spam. Unsubscribe anytime.</p>

      </div>
    </section>
  );
};

export default NewsletterSection;
