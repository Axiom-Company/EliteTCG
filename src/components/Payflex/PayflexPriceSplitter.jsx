import { useState, useEffect } from 'react';
import { getPayflexConfiguration } from '../../services/payflexApi';

/**
 * Shows "or 4 interest-free payments of R{price/4} with Payflex" below a product price.
 * Only renders if the price is within Payflex's configured min/max range.
 */
const PayflexPriceSplitter = ({ price }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    getPayflexConfiguration().then(setConfig).catch(() => {});
  }, []);

  if (!config?.available || !price) return null;

  const min = parseFloat(config.min_amount);
  const max = parseFloat(config.max_amount);
  if (price < min || price > max) return null;

  const installment = (price / 4).toFixed(2);

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-gray-500">
        or 4 interest-free payments of{' '}
        <span className="font-medium text-gray-700">R{installment}</span>
        {' '}with
      </span>
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded"
        style={{ backgroundColor: '#00c9a7', color: '#fff' }}
      >
        Payflex
      </span>
    </div>
  );
};

export default PayflexPriceSplitter;
