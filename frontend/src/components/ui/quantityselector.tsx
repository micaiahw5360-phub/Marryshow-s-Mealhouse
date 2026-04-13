import { Button } from './button';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        -
      </button>
      <span className="w-8 text-center font-medium">{quantity}</span>
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        +
      </button>
    </div>
  );
}