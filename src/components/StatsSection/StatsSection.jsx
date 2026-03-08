const stats = [
  { value: '100%', label: 'Authentic Products' },
  { value: 'Nationwide', label: 'Delivery Across SA' },
  { value: 'Secure', label: 'Payments via PayFast' },
];

const StatsSection = () => (
  <section className="bg-white py-14 md:py-16">
    <div className="container max-w-4xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-gray-200">
        {stats.map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center text-center gap-2">
            <span className="text-3xl md:text-4xl font-medium text-gray-900 tracking-tight">{value}</span>
            <span className="text-[11px] uppercase tracking-widest text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
