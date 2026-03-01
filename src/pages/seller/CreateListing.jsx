import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ELITE_API_URL } from '../../config/api';
import { searchCards, evaluateCard, conditionToApiCode } from '../../services/cardEvaluationApi';
import CardScanner from '../../components/marketplace/CardScanner';
import { Search, Layers, Camera, Loader2 } from 'lucide-react';

const conditions = [
  { value: 'mint', label: 'Mint' },
  { value: 'near_mint', label: 'Near Mint' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'played', label: 'Played' },
  { value: 'poor', label: 'Poor' }
];

const categories = [
  { value: 'singles', label: 'Singles' },
  { value: 'sealed', label: 'Sealed Products' },
  { value: 'accessories', label: 'Accessories' }
];

// Client-side commission calculation (mirrors server tiers)
function calcCommission(price) {
  if (!price || price < 10) return { fee: 0, percentage: 0, seller_receives: price || 0 };
  if (price <= 50) { const f = parseFloat((price * 0.08).toFixed(2)); return { fee: f, percentage: 8, seller_receives: parseFloat((price - f).toFixed(2)) }; }
  if (price <= 100) { const f = parseFloat((price * 0.075).toFixed(2)); return { fee: f, percentage: 7.5, seller_receives: parseFloat((price - f).toFixed(2)) }; }
  if (price <= 1000) { const f = parseFloat((price * 0.06).toFixed(2)); return { fee: f, percentage: 6, seller_receives: parseFloat((price - f).toFixed(2)) }; }
  if (price <= 5000) { const f = parseFloat((price * 0.05).toFixed(2)); return { fee: f, percentage: 5, seller_receives: parseFloat((price - f).toFixed(2)) }; }
  const f = parseFloat((price * 0.04).toFixed(2));
  return { fee: f, percentage: 4, seller_receives: parseFloat((price - f).toFixed(2)) };
}

const CreateListing = () => {
  const { isAuthenticated, isSeller, getToken } = useCustomerAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    card_name: '',
    set_name: '',
    card_number: '',
    condition: 'near_mint',
    language: 'English',
    is_graded: false,
    grading_company: '',
    grade: '',
    certificate_number: '',
    price: '',
    compare_at_price: '',
    quantity: 1,
    category: 'singles',
    is_negotiable: false
  });

  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Card evaluation state
  const [findTab, setFindTab] = useState('search'); // search | browse | scan
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [browseSetId, setBrowseSetId] = useState('');
  const [browseCardNumber, setBrowseCardNumber] = useState('');
  const [evaluation, setEvaluation] = useState(null); // { market_price_usd, market_price_zar, suggested_price_zar }
  const [evaluating, setEvaluating] = useState(false);

  // Commission computed from price
  const priceNum = parseFloat(formData.price) || 0;
  const commission = calcCommission(priceNum);

  if (!isAuthenticated) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-8">You need to sign in to create a listing.</p>
          <Link
            to="/login"
            state={{ from: { pathname: '/seller/create-listing' } }}
            className="px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800"
          >
            Sign In
          </Link>
        </div>
      </section>
    );
  }

  if (!isSeller) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become a Seller First</h1>
          <p className="text-gray-600 mb-8">You need to be a verified seller to create listings.</p>
          <Link
            to="/become-seller"
            className="px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800"
          >
            Apply to Become a Seller
          </Link>
        </div>
      </section>
    );
  }

  // Debounced card search
  const doSearch = useCallback(async (query) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const data = await searchCards(query);
      setSearchResults(data.cards || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
    const timeout = setTimeout(() => doSearch(searchQuery), 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, doSearch]);

  const applyCardData = async (card) => {
    // Auto-fill form fields from card data
    setFormData(prev => ({
      ...prev,
      title: card.name || prev.title,
      card_name: card.name || prev.card_name,
      set_name: card.set_name || prev.set_name,
      card_number: card.number || prev.card_number
    }));

    // Add card image if available
    if (card.image && imageUrls.length < 5) {
      setImageUrls(prev => prev.includes(card.image) ? prev : [...prev, card.image]);
    }

    setSearchResults([]);
    setSearchQuery('');

    // Auto-evaluate if we have set + number
    if (card.set_id && card.number) {
      setEvaluating(true);
      try {
        const apiCondition = conditionToApiCode[formData.condition] || 'NM';
        const evalData = await evaluateCard(card.set_id, card.number, apiCondition);
        setEvaluation(evalData);
        // Set suggested price as default
        if (evalData.suggested_price_zar && !formData.price) {
          setFormData(prev => ({ ...prev, price: evalData.suggested_price_zar.toFixed(2) }));
        }
      } catch {
        // Evaluation optional — don't block listing creation
      } finally {
        setEvaluating(false);
      }
    }
  };

  const handleBrowseLookup = async () => {
    if (!browseSetId || !browseCardNumber) return;
    setEvaluating(true);
    try {
      const apiCondition = conditionToApiCode[formData.condition] || 'NM';
      const evalData = await evaluateCard(browseSetId, browseCardNumber, apiCondition);
      setEvaluation(evalData);
      if (evalData.card) {
        setFormData(prev => ({
          ...prev,
          title: evalData.card.name || prev.title,
          card_name: evalData.card.name || prev.card_name,
          set_name: evalData.card.set_name || prev.set_name,
          card_number: browseCardNumber
        }));
        if (evalData.card.image && imageUrls.length < 5) {
          setImageUrls(prev => prev.includes(evalData.card.image) ? prev : [...prev, evalData.card.image]);
        }
      }
      if (evalData.suggested_price_zar && !formData.price) {
        setFormData(prev => ({ ...prev, price: evalData.suggested_price_zar.toFixed(2) }));
      }
    } catch {
      setError('Could not evaluate this card. You can still list it manually.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleScanResult = (card) => {
    applyCardData(card);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageUrls.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = getToken();
      const newUrls = [];

      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);

        const res = await fetch(`${ELITE_API_URL}/api/upload/seller-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        newUrls.push(data.url);
      }

      setImageUrls(prev => [...prev, ...newUrls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = getToken();

      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : undefined,
        quantity: parseInt(formData.quantity),
        images: imageUrls,
        // Include evaluation data if available
        ...(evaluation && {
          market_price_usd: evaluation.market_price_usd,
          market_price_zar: evaluation.market_price_zar
        })
      };

      if (!listingData.compare_at_price) delete listingData.compare_at_price;
      if (!listingData.card_name) delete listingData.card_name;
      if (!listingData.set_name) delete listingData.set_name;
      if (!listingData.card_number) delete listingData.card_number;
      if (!listingData.description) delete listingData.description;
      if (!listingData.is_graded) {
        delete listingData.grading_company;
        delete listingData.grade;
        delete listingData.certificate_number;
      }
      if (!listingData.market_price_usd) delete listingData.market_price_usd;
      if (!listingData.market_price_zar) delete listingData.market_price_zar;

      const res = await fetch(`${ELITE_API_URL}/api/marketplace/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(listingData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      navigate(`/marketplace/${data.listing.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${ELITE_API_URL}${url}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Listing</h1>
      <p className="text-gray-600 mb-8">List your Pokemon card for sale</p>

      {error && (
        <p className="text-red-600 text-sm mb-6">{error}</p>
      )}

      {/* Find Your Card Section */}
      <div className="mb-8 p-5 bg-gray-50 rounded-2xl">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Find Your Card</h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-200 rounded-lg p-1">
          {[
            { key: 'search', label: 'Text Search', icon: Search },
            { key: 'browse', label: 'Browse by Set', icon: Layers },
            { key: 'scan', label: 'Camera Scan', icon: Camera }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFindTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-md transition-colors ${
                findTab === tab.key ? 'bg-white text-gray-900 font-medium shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Text Search */}
        {findTab === 'search' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by card name (e.g. Charizard VMAX)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {searchResults.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyCardData(card)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white transition-colors text-left"
                  >
                    {card.image && (
                      <img src={card.image} alt={card.name} className="w-10 h-14 object-contain rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{card.name}</p>
                      <p className="text-xs text-gray-500">{card.set_name} #{card.number}</p>
                    </div>
                    {card.market_price_usd && (
                      <span className="text-xs text-gray-400">${card.market_price_usd}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Browse by Set */}
        {findTab === 'browse' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={browseSetId}
                onChange={(e) => setBrowseSetId(e.target.value)}
                placeholder="Set ID (e.g. base1, swsh12)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              />
              <input
                type="text"
                value={browseCardNumber}
                onChange={(e) => setBrowseCardNumber(e.target.value)}
                placeholder="Card # (e.g. 4, 74)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleBrowseLookup}
              disabled={!browseSetId || !browseCardNumber || evaluating}
              className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {evaluating ? <><Loader2 className="w-4 h-4 animate-spin" /> Looking up...</> : 'Look Up Card'}
            </button>
          </div>
        )}

        {/* Tab 3: Camera Scan */}
        {findTab === 'scan' && (
          <CardScanner onCardFound={handleScanResult} />
        )}

        {/* Evaluation result */}
        {evaluation && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-2">Estimated Market Value</p>
            <div className="flex items-baseline gap-4">
              {evaluation.market_price_zar && (
                <span className="text-lg font-bold text-gray-900">R{evaluation.market_price_zar.toLocaleString()}</span>
              )}
              {evaluation.market_price_usd && (
                <span className="text-sm text-gray-500">(${evaluation.market_price_usd} USD)</span>
              )}
            </div>
            {evaluation.suggested_price_zar && (
              <p className="text-xs text-gray-500 mt-1">
                Suggested listing price for {formData.condition.replace('_', ' ')}: R{evaluation.suggested_price_zar.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {evaluating && !evaluation && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Evaluating card...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Images <span className="text-gray-400 font-normal">(up to 5)</span>
          </label>
          <div className="flex gap-3 flex-wrap">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <img src={getImageSrc(url)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-gray-900 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {imageUrls.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full" />
                ) : (
                  <span className="text-2xl text-gray-400">+</span>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={200}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
            placeholder="e.g. Charizard VMAX Rainbow Rare #074"
          />
        </div>

        {/* Card Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="card_name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Card Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="card_name"
              name="card_name"
              type="text"
              value={formData.card_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="Charizard VMAX"
            />
          </div>
          <div>
            <label htmlFor="set_name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Set Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="set_name"
              name="set_name"
              type="text"
              value={formData.set_name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="Champion's Path"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-1.5">
              Card Number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="card_number"
              name="card_number"
              type="text"
              value={formData.card_number}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
              placeholder="074/073"
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1.5">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors bg-white"
            >
              <option value="English">English</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Chinese">Chinese</option>
              <option value="German">German</option>
              <option value="French">French</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            maxLength={2000}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors resize-none"
            placeholder="Describe your card, any notable features, flaws, etc."
          />
        </div>

        {/* Condition & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1.5">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors bg-white"
            >
              {conditions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors bg-white"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grading */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_graded"
              checked={formData.is_graded}
              onChange={handleChange}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Professionally Graded (PSA, BGS, CGC, etc.)</span>
          </label>

          {formData.is_graded && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="grading_company" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company
                </label>
                <select
                  id="grading_company"
                  name="grading_company"
                  value={formData.grading_company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors bg-white"
                >
                  <option value="">Select...</option>
                  <option value="PSA">PSA</option>
                  <option value="BGS">BGS</option>
                  <option value="CGC">CGC</option>
                  <option value="ACE">ACE</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Grade
                </label>
                <input
                  id="grade"
                  name="grade"
                  type="text"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="10, 9.5"
                />
              </div>
              <div>
                <label htmlFor="certificate_number" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cert #
                </label>
                <input
                  id="certificate_number"
                  name="certificate_number"
                  type="text"
                  value={formData.certificate_number}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                  placeholder="Optional"
                />
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
              Price (ZAR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R</span>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label htmlFor="compare_at_price" className="block text-sm font-medium text-gray-700 mb-1.5">
              Compare Price <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R</span>
              <input
                id="compare_at_price"
                name="compare_at_price"
                type="number"
                value={formData.compare_at_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
                placeholder="Original price"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1.5">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              max="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_negotiable"
                checked={formData.is_negotiable}
                onChange={handleChange}
                className="w-4 h-4 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Price is negotiable</span>
            </label>
          </div>
        </div>

        {/* Dynamic Commission Display */}
        {priceNum > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-1.5">
            {evaluation?.market_price_zar && (
              <p className="text-sm text-gray-600">
                Estimated Market Value: <span className="font-medium text-gray-900">R{evaluation.market_price_zar.toLocaleString()}</span>
              </p>
            )}
            <p className="text-sm text-gray-600">
              Platform fee: <span className="font-medium text-gray-900">{commission.percentage}% (R{commission.fee.toFixed(2)})</span>
            </p>
            <p className="text-sm text-gray-900 font-medium">
              You'll receive: R{commission.seller_receives.toFixed(2)}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:border-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 py-3 px-6 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;
