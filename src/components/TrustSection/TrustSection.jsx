import { Link } from 'react-router-dom';

const TrustSection = () => {
  return (
    <section className="bg-white py-24 md:py-16">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-2">About Elite TCG</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Elite TCG is South Africa's online store for authentic Pokémon Trading Card Game products. Browse and buy sealed booster boxes, elite trainer boxes, single cards and accessories, or join our marketplace to buy and sell with other collectors.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-2">Sealed & Authentic</h3>
            <p className="text-sm text-gray-600">
              Every Booster Box and Elite Trainer Box is 100% verified and sourced through trusted channels.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-2">Nationwide Shipping</h3>
            <p className="text-sm text-gray-600">
              Fast, tracked delivery via The Courier Guy to all SA provinces — from Cape Town to JHB and beyond.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-2">Secure Payments</h3>
            <p className="text-sm text-gray-600">
              All transactions are processed securely through PayFast. Your account and personal data are protected in line with our{' '}
              <Link to="/privacy-policy" className="text-blue-600 hover:underline">privacy policy</Link>.
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-16">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 py-3 px-8 text-lg font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-250"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
