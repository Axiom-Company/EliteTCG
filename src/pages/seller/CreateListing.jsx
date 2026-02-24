import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const API_BASE_URL = 'http://localhost:3001';

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
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_BASE_URL}/api/upload/seller-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
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
        images: imageUrls
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

      const res = await fetch(`${API_BASE_URL}/api/marketplace/listings`, {
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

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Listing</h1>
      <p className="text-gray-600 mb-8">List your Pokemon card for sale</p>

      {error && (
        <p className="text-red-600 text-sm mb-6">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Images <span className="text-gray-400 font-normal">(up to 5)</span>
          </label>
          <div className="flex gap-3 flex-wrap">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                <img src={url.startsWith('/') ? `${API_BASE_URL}${url}` : url} alt="" className="w-full h-full object-cover" />
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

        {formData.price && (
          <p className="text-sm text-gray-500">
            You'll receive R{(parseFloat(formData.price) * 0.9).toFixed(2)} per sale (10% platform fee)
          </p>
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
