import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { ELITE_API_URL, getImageUrl } from '@/config/api';

const API_BASE = ELITE_API_URL;

const SetCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-50" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-4/5 mx-auto" />
      <div className="h-3 bg-gray-100 rounded w-2/5 mx-auto" />
    </div>
  </div>
);

const Sets = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sets?limit=100`);
        const data = await res.json();
        setSets(data.sets || []);
      } catch (err) {
        console.error('Failed to fetch sets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-0">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">All Sets</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">All Sets</h1>
          <p className="text-sm text-gray-400 mt-1">Browse all Pokémon TCG expansions</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SetCardSkeleton key={i} />)}
          </div>
        ) : sets.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <LayoutGrid className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">No sets available</p>
            <p className="text-sm text-gray-400">Check back soon for new expansions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sets.map((set) => (
              <Link
                key={set.id}
                to={`/sets/${set.id}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-200"
              >
                <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-white p-4">
                  {getImageUrl(set.image) ? (
                    <img
                      src={getImageUrl(set.image)}
                      alt={set.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-300">{set.code?.[0] || '?'}</span>
                    </div>
                  )}
                  {set.is_new && (
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-primary text-white">
                      New
                    </span>
                  )}
                </div>
                <div className="p-3 text-center">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{set.name}</h3>
                  {set.release_date && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(set.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sets;
