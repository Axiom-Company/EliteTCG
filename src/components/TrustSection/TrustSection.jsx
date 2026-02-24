const TrustSection = () => {
  return (
    <section className="bg-white py-24 md:py-16">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-2">South Africa’s Home for Pokémon Cards</h2>
          <p className="text-sm text-gray-500">Connecting Trainers across the nation with the world of Pokémon.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-2">Sealed & Authentic</h3>
            <p className="text-sm text-gray-600">
              Every Booster Box and Elite Trainer Box is 100% verified and sourced through trusted channels. Our primary supplier is{' '}
              <a href="https://rocketgrunttcg.co.za" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                RocketGruntTCG
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-2">Nationwide Shipping</h3>
            <p className="text-sm text-gray-600">
              We offer fast, tracked delivery to all SA provinces. Get your Pokémon TCG products delivered to your door, from Cape Town to JHB and beyond.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-2">Competitive Pricing</h3>
            <p className="text-sm text-gray-600">
              We provide the best market rates for Pokémon TCG in South Africa, ensuring you get the best value for your collection.
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-16">
          <a
            href="/#products" // Assuming #products goes to the products section
            className="inline-flex items-center justify-center gap-2 py-3 px-8 text-lg font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-250"
          >
            Shop Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;

