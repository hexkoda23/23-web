import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getDefaultSize, inferColorTags, inferFunctionalCategory } from '../lib/styleEngine';
import ColorwayPicker from './ColorwayPicker';
const SWATCHES = { black: '#242424', white: '#eeeae3', cream: '#ddd1b8', green: '#455846', blue: '#334b70', pink: '#dfa2b4', orange: '#cd7748', yellow: '#ceaf57', red: '#983b39', brown: '#745440', denim: '#586a7d', grey: '#888', neutral: '#ada79a' };
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const images = product.images?.length ? product.images : [product.image];
  const color = inferColorTags(product)[0] || 'neutral';
  const unavailable = !product.inStock && product.category !== 'unreleased';
  return <article className="product-card luxury-product">
    <div className="product-image-wrap"><Link to={`/product/${product.id}`} className="product-image-link"><img src={images[imageIndex]} alt={product.name} loading="lazy" className="product-primary" />{images.length > 1 && <img src={images[(imageIndex + 1) % images.length]} alt={`${product.name}, alternate view`} loading="lazy" className="product-alternate" />}</Link><span className="product-badge">{product.category === 'unreleased' ? 'Unreleased' : product.isNew ? 'New' : ''}</span><button className="product-quick-add" aria-label={unavailable ? `${product.name} sold out` : `Quick add ${product.name}`} disabled={unavailable} onClick={() => addToCart(product, getDefaultSize(product), 1)}>{unavailable ? <Check size={16} strokeWidth={1.3} /> : <Plus size={18} strokeWidth={1.3} />}<span>{unavailable ? 'Sold out' : 'Quick add'}</span></button>{images.length > 1 && <div className="product-image-controls"><button aria-label={`Previous image of ${product.name}`} onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}><ChevronLeft size={15} /></button><span>{imageIndex + 1} / {images.length}</span><button aria-label={`Next image of ${product.name}`} onClick={() => setImageIndex((imageIndex + 1) % images.length)}><ChevronRight size={15} /></button></div>}</div>
    <div className="product-info"><p className="product-category">{inferFunctionalCategory(product).replace('fullFit', 'full set')}</p><Link to={`/product/${product.id}`}><h3>{product.collectionName || product.name}</h3></Link><p className="product-price">₦{Number(product.price).toLocaleString('en-NG')}</p>{product.collectionName ? <ColorwayPicker product={product} compact /> : <span className="product-swatch" style={{ background: SWATCHES[color] || SWATCHES.neutral }} title={color} />}</div>
  </article>;
}
