import { Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';

export default function ColorwayPicker({ product, compact = false }) {
  if (!product.collectionName) return null;
  const variants = PRODUCTS.filter(p => p.variantGroup === product.variantGroup && !p.hidden);
  return <div className={`colorway-picker ${compact ? 'compact' : ''}`}>
    {!compact && <p className="eyebrow">Color · {product.colorName}</p>}
    <div className="colorway-options" role="group" aria-label={`${product.collectionName} colors`}>
      {variants.map(variant => <Link key={variant.id} to={`/product/${variant.id}`} className={`colorway-option ${variant.id === product.id ? 'selected' : ''}`} aria-label={`${variant.collectionName} in ${variant.colorName}`} aria-current={variant.id === product.id ? 'page' : undefined} title={variant.colorName}>
        <span style={{ background: variant.swatch }} />
        {!compact && <span>{variant.colorName}</span>}
      </Link>)}
    </div>
  </div>;
}
