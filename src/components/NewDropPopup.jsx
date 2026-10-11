import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowUpRight } from 'lucide-react';
import { NEW_DROP_GROUPS } from '../data/newDrop';

const DISMISS_KEY = 'twenty3-raglan-terrain-drop-dismissed';
export default function NewDropPopup() {
  const [open, setOpen] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [viewIndex, setViewIndex] = useState(0);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const group = NEW_DROP_GROUPS[groupIndex];
  const product = group.products[colorIndex];

  useEffect(() => {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISS_KEY) === 'true'; } catch { /* Private browsing still permits the preview. */ }
    if (dismissed) return;
    const timer = window.setTimeout(() => setOpen(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try { sessionStorage.setItem(DISMISS_KEY, 'true'); } catch { /* Dismissal remains available without storage. */ }
  };
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const triggerElement = trigger.current;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    const onKey = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        try { sessionStorage.setItem(DISMISS_KEY, 'true'); } catch { /* optional storage */ }
      }
      if (event.key === 'Tab') {
        const focusable = dialog.current?.querySelectorAll('a[href],button:not(:disabled)');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      if (previousFocus?.isConnected) previousFocus.focus();
      else triggerElement?.focus();
    };
  }, [open]);

  return <>
    <button ref={trigger} className="new-drop-trigger" onClick={() => setOpen(true)}><span className="drop-dot" />New drop <ArrowUpRight size={14} /></button>
    {open && <div className="drop-overlay" onClick={dismiss}>
      <section ref={dialog} className="drop-dialog" role="dialog" aria-modal="true" aria-labelledby="drop-title" onClick={event => event.stopPropagation()}>
        <button className="drop-close" aria-label="Close new arrivals" onClick={dismiss}><X size={22} strokeWidth={1.2} /></button>
        <div className="drop-visual"><img src={product.images[viewIndex]} alt={`${product.name}, ${product.imageLabels[viewIndex]}`} /><div className="drop-view-controls">{product.imageLabels.map((label, index) => <button key={label} onClick={() => setViewIndex(index)} aria-pressed={viewIndex === index}>{index === 0 ? 'Front' : 'Back'}</button>)}</div>{product.generatedBackView && viewIndex === 1 && <p className="drop-image-note">Generated rear-view mockup</p>}</div>
        <div className="drop-copy"><p className="eyebrow">Just arrived · Twenty3</p><div className="drop-tabs" role="group" aria-label="New collections">{NEW_DROP_GROUPS.map((collection, index) => <button key={collection.id} aria-pressed={groupIndex === index} onClick={() => { setGroupIndex(index); setColorIndex(0); setViewIndex(0); }}>{collection.title}</button>)}</div><h2 id="drop-title">{group.title}</h2><p className="drop-subtitle">{group.subtitle}</p><p className="drop-price">₦{product.price.toLocaleString('en-NG')} <span>per shirt</span></p><p className="drop-description">{product.description}</p><div className="drop-colors"><p className="eyebrow">Color · {product.colorName}</p><div>{group.products.map((variant, index) => <button key={variant.id} onClick={() => { setColorIndex(index); setViewIndex(0); }} aria-label={`Choose ${variant.colorName}`} aria-pressed={colorIndex === index} title={variant.colorName}><span style={{ background: variant.swatch }} /></button>)}</div></div><Link to={`/product/${product.id}`} onClick={dismiss} className="house-button">Discover this piece <ArrowUpRight size={14} /></Link><Link to="/shop?category=new" className="text-link" onClick={dismiss}>Explore all new arrivals</Link></div>
      </section>
    </div>}
  </>;
}
