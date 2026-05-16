import { useState } from 'react';

export default function BrandLogo({ className = 'h-8 md:h-10' }) {
  const [fallback, setFallback] = useState(false);

  if (fallback) {
    return (
      <span className="font-attention attention-heading text-2xl md:text-3xl uppercase leading-none">
        23<span className="font-body font-medium normal-case">Look</span>
      </span>
    );
  }

  return (
    <img
      src="/lookbook/logo4.jpg"
      alt="23Look"
      className={`${className} object-contain`}
      onError={() => setFallback(true)}
    />
  );
}
