// TWENTY3™ wordmark. Rendered as text (Archivo Black) rather than the raster
// logo so it inherits currentColor and sits cleanly on any background —
// white on dark surfaces, black on light ones. Size with a text-* class.
export default function BrandLogo({ className = 'text-lg' }) {
  return (
    <span className={`brand-wordmark ${className}`} aria-label="TWENTY3">
      TWENTY3<span className="tm">TM</span>
    </span>
  );
}
