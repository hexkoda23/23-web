import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { getGarmentMeasurements } from '../data/measurements';

/* ----------------------------------------------------------------------------
 * Technical line-art diagrams (one per garment type).
 * Each returns an <svg> with the garment outline + labelled double-arrow
 * callouts that mirror the measurement rows in measurements.js.
 * -------------------------------------------------------------------------- */

const STROKE = '#111';
const CALL = '#555'; // callout arrow + label colour

function DiagramShell({ type, children }) {
  return (
    <svg
      viewBox="0 0 280 340"
      className="w-full max-w-[240px] h-auto"
      role="img"
      aria-label={`${type} measurement diagram`}
    >
      <defs>
        <marker
          id={`gm-arrow-${type}`}
          markerWidth="9"
          markerHeight="9"
          refX="4.5"
          refY="4.5"
          orient="auto-start-reverse"
        >
          <path d="M1,1 L8,4.5 L1,8" fill="none" stroke={CALL} strokeWidth="1.2" />
        </marker>
      </defs>
      <g fill="none" stroke={STROKE} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
    </svg>
  );
}

function CalloutText({ x, y, children, rotate }) {
  return (
    <text
      x={x}
      y={y}
      fill={CALL}
      fontSize="8"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
      letterSpacing="0.5"
      textAnchor="middle"
      transform={rotate ? `rotate(-90 ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

function TrousersDiagram() {
  return (
    <DiagramShell type="trousers">
      {/* waistband + body outline */}
      <path d="M70,45 L190,45 L188,70 L182,300 L142,300 L140,150 L130,150 L120,300 L78,300 L72,70 Z" />
      <path d="M70,45 L190,45" strokeWidth="2.4" />
      {/* drawstring */}
      <path d="M118,45 L124,62 M162,45 L156,62" strokeWidth="1" />

      {/* WAIST */}
      <line x1="72" y1="38" x2="188" y2="38" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-trousers)" markerEnd="url(#gm-arrow-trousers)" />
      <CalloutText x="130" y="33">WAIST</CalloutText>

      {/* FRONT RISE (right inner: crotch to waist) */}
      <line x1="140" y1="150" x2="140" y2="45" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-trousers)" markerEnd="url(#gm-arrow-trousers)" />
      <CalloutText x="152" y="100">FRONT RISE</CalloutText>

      {/* SIDESEAM LENGTH (far left) */}
      <line x1="70" y1="45" x2="78" y2="300" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-trousers)" markerEnd="url(#gm-arrow-trousers)" />
      <CalloutText x="40" y="175" rotate> SIDESEAM LENGTH </CalloutText>

      {/* INSEAM (inner right) */}
      <line x1="140" y1="150" x2="142" y2="300" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-trousers)" markerEnd="url(#gm-arrow-trousers)" />
      <CalloutText x="156" y="232">INSEAM</CalloutText>

      {/* LEG OPENING (bottom left) */}
      <line x1="78" y1="308" x2="118" y2="308" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-trousers)" markerEnd="url(#gm-arrow-trousers)" />
      <CalloutText x="98" y="320">LEG OPENING</CalloutText>
    </DiagramShell>
  );
}

function ShirtDiagram() {
  return (
    <DiagramShell type="shirt">
      {/* body + collar + short sleeves */}
      <path d="M60,55 L200,55 L188,300 L72,300 Z" />
      {/* neck */}
      <path d="M115,55 Q130,72 145,55" />
      {/* left sleeve */}
      <path d="M60,55 L35,78 L46,112 L70,102" />
      {/* right sleeve */}
      <path d="M200,55 L225,78 L214,112 L190,102" />

      {/* SHOULDER */}
      <line x1="62" y1="50" x2="198" y2="50" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-shirt)" markerEnd="url(#gm-arrow-shirt)" />
      <CalloutText x="130" y="45">SHOULDER</CalloutText>

      {/* SLEEVE LENGTH (left) */}
      <line x1="58" y1="58" x2="44" y2="108" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-shirt)" markerEnd="url(#gm-arrow-shirt)" />
      <CalloutText x="26" y="86" rotate> SLEEVE LENGTH </CalloutText>

      {/* PIT TO PIT */}
      <line x1="72" y1="122" x2="188" y2="122" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-shirt)" markerEnd="url(#gm-arrow-shirt)" />
      <CalloutText x="130" y="117">PIT TO PIT</CalloutText>

      {/* BACK LENGTH (right seam) */}
      <line x1="200" y1="58" x2="188" y2="300" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-shirt)" markerEnd="url(#gm-arrow-shirt)" />
      <CalloutText x="244" y="180" rotate> BACK LENGTH </CalloutText>
    </DiagramShell>
  );
}

function ButtonUpDiagram() {
  return (
    <DiagramShell type="button-up">
      {/* body + collar + long sleeves */}
      <path d="M55,52 L205,52 L190,300 L70,300 Z" />
      {/* neck */}
      <path d="M112,52 Q130,70 148,52" />
      {/* left long sleeve */}
      <path d="M55,52 L26,72 L36,212 L80,200" />
      {/* right long sleeve */}
      <path d="M205,52 L234,72 L224,212 L180,200" />
      {/* button placket */}
      <line x1="130" y1="60" x2="130" y2="300" strokeWidth="1" />

      {/* SHOULDER */}
      <line x1="57" y1="47" x2="203" y2="47" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-button-up)" markerEnd="url(#gm-arrow-button-up)" />
      <CalloutText x="130" y="42">SHOULDER</CalloutText>

      {/* SLEEVE LENGTH (left) */}
      <line x1="55" y1="55" x2="36" y2="208" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-button-up)" markerEnd="url(#gm-arrow-button-up)" />
      <CalloutText x="16" y="135" rotate> SLEEVE LENGTH </CalloutText>

      {/* PIT TO PIT */}
      <line x1="70" y1="122" x2="190" y2="122" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-button-up)" markerEnd="url(#gm-arrow-button-up)" />
      <CalloutText x="130" y="117">PIT TO PIT</CalloutText>

      {/* BACK LENGTH (right seam) */}
      <line x1="205" y1="55" x2="190" y2="300" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-button-up)" markerEnd="url(#gm-arrow-button-up)" />
      <CalloutText x="244" y="180" rotate> BACK LENGTH </CalloutText>
    </DiagramShell>
  );
}

function HoodieDiagram() {
  return (
    <DiagramShell type="hoodie">
      {/* body */}
      <path d="M50,80 L210,80 L192,300 L68,300 Z" />
      {/* hood */}
      <path d="M95,80 Q130,30 165,80" />
      {/* neck opening */}
      <path d="M110,80 Q130,95 150,80" />
      {/* left sleeve with ribbed cuff */}
      <path d="M50,80 L24,104 L34,232 L40,248 L66,240 L80,210" />
      {/* right sleeve */}
      <path d="M210,80 L236,104 L226,232 L220,248 L184,240 L170,210" />
      {/* centre zip */}
      <line x1="130" y1="80" x2="130" y2="300" strokeWidth="1" />
      {/* kangaroo pocket */}
      <path d="M88,235 Q130,250 172,235" strokeWidth="1" />
      {/* ribbed hem */}
      <path d="M68,300 L192,300" strokeWidth="2.4" />

      {/* SHOULDER */}
      <line x1="52" y1="75" x2="208" y2="75" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-hoodie)" markerEnd="url(#gm-arrow-hoodie)" />
      <CalloutText x="130" y="70">SHOULDER</CalloutText>

      {/* SLEEVE LENGTH (left) */}
      <line x1="50" y1="82" x2="36" y2="230" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-hoodie)" markerEnd="url(#gm-arrow-hoodie)" />
      <CalloutText x="14" y="155" rotate> SLEEVE LENGTH </CalloutText>

      {/* PIT TO PIT */}
      <line x1="68" y1="150" x2="192" y2="150" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-hoodie)" markerEnd="url(#gm-arrow-hoodie)" />
      <CalloutText x="130" y="145">PIT TO PIT</CalloutText>

      {/* BACK LENGTH (right seam) */}
      <line x1="210" y1="82" x2="192" y2="300" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-hoodie)" markerEnd="url(#gm-arrow-hoodie)" />
      <CalloutText x="248" y="190" rotate> BACK LENGTH </CalloutText>
    </DiagramShell>
  );
}

function SetDiagram() {
  // Two-piece "up and down" set: a zip hoodie/jacket on top, joggers below.
  return (
    <DiagramShell type="set">
      {/* ---- TOP: zip hoodie / jacket ---- */}
      <path d="M58,30 L202,30 L184,120 L76,120 Z" />
      {/* hood */}
      <path d="M100,30 Q130,2 160,30" />
      {/* neck */}
      <path d="M112,30 Q130,42 148,30" />
      {/* left sleeve */}
      <path d="M58,30 L34,48 L42,118 L70,112" />
      {/* right sleeve */}
      <path d="M202,30 L226,48 L218,118 L190,112" />
      {/* centre zip */}
      <line x1="130" y1="30" x2="130" y2="120" strokeWidth="1" />
      {/* kangaroo pocket */}
      <path d="M88,100 Q130,112 172,100" strokeWidth="1" />
      {/* hem */}
      <path d="M76,120 L184,120" strokeWidth="2.4" />

      {/* TOP SHOULDER */}
      <line x1="60" y1="25" x2="200" y2="25" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-set)" markerEnd="url(#gm-arrow-set)" />
      <CalloutText x="130" y="20">SHOULDER</CalloutText>

      {/* TOP SLEEVE LENGTH (left) */}
      <line x1="58" y1="33" x2="42" y2="116" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-set)" markerEnd="url(#gm-arrow-set)" />
      <CalloutText x="18" y="78" rotate> TOP SLEEVE </CalloutText>

      {/* TOP LENGTH (right seam) */}
      <line x1="202" y1="33" x2="184" y2="120" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-set)" markerEnd="url(#gm-arrow-set)" />
      <CalloutText x="248" y="78" rotate> TOP LENGTH </CalloutText>

      {/* ---- BOTTOM: joggers ---- */}
      <path d="M82,150 L178,150 L174,300 L138,300 L130,200 L122,300 L86,300 Z" />
      {/* waistband */}
      <path d="M82,150 L178,150" strokeWidth="2.4" />
      {/* drawstring */}
      <path d="M120,150 L124,165 M140,150 L136,165" strokeWidth="1" />

      {/* BOTTOM WAIST */}
      <line x1="84" y1="143" x2="176" y2="143" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-set)" markerEnd="url(#gm-arrow-set)" />
      <CalloutText x="130" y="138">BOTTOM WAIST</CalloutText>

      {/* BOTTOM INSEAM (inner) */}
      <line x1="130" y1="200" x2="130" y2="300" stroke={CALL} strokeWidth="1" markerStart="url(#gm-arrow-set)" markerEnd="url(#gm-arrow-set)" />
      <CalloutText x="142" y="252">INSEAM</CalloutText>
    </DiagramShell>
  );
}

const DIAGRAMS = {
  trousers: TrousersDiagram,
  shirt: ShirtDiagram,
  'button-up': ButtonUpDiagram,
  hoodie: HoodieDiagram,
  set: SetDiagram,
  top: ShirtDiagram, // tops reuse the shirt silhouette (no separate art requested)
};

/* ----------------------------------------------------------------------------
 * Section component
 * -------------------------------------------------------------------------- */

export default function GarmentMeasurements({ product, selectedSize, onSelectSize }) {
  const data = getGarmentMeasurements(product);
  const [open, setOpen] = useState(true);
  const [guideOpen, setGuideOpen] = useState(true);

  if (!data) return null;
  const { type, table, sizes } = data;
  const Diagram = DIAGRAMS[type] || DIAGRAMS.top;

  // Active size = the one chosen above, else the first available size.
  const activeSize = sizes.includes(selectedSize) ? selectedSize : sizes[0];
  const activeValues = table.values[activeSize] || {};

  return (
    <section className="pt-8 border-t border-gray-200 space-y-6">
      {/* ---- Garment Measurements (collapsible) ---- */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900">
            Garment Measurements
          </h3>
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-400 hover:text-black transition-colors"
            aria-label={open ? 'Collapse measurements' : 'Expand measurements'}
          >
            {open ? <Minus size={16} /> : <Plus size={16} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                {/* Diagram */}
                <div className="flex items-center justify-center bg-white">
                  <Diagram />
                </div>

                {/* Size selector + values */}
                <div>
                  <h4 className="text-center text-sm font-semibold text-gray-900 mb-3">
                    Select a Size
                  </h4>
                  <div className="flex justify-center flex-wrap gap-4 mb-6">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => onSelectSize(size)}
                        className={`text-sm transition-all ${
                          activeSize === size
                            ? 'underline underline-offset-4 font-bold'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {table.rows.map((row) => (
                      <div
                        key={row.key}
                        className="flex justify-between border-b border-gray-100 pb-1.5 text-sm"
                      >
                        <span className="text-gray-500">{row.label}</span>
                        <span className="font-medium text-gray-900">
                          {activeValues[row.key] != null
                            ? `${activeValues[row.key]} in`
                            : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3 text-center">
                    Measurements shown for size {activeSize}.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Size Guide (collapsible) ---- */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900">
            Size Guide
          </h3>
          <button
            onClick={() => setGuideOpen(!guideOpen)}
            className="text-gray-400 hover:text-black transition-colors"
            aria-label={guideOpen ? 'Collapse size guide' : 'Expand size guide'}
          >
            {guideOpen ? <Minus size={16} /> : <Plus size={16} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {guideOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="text-sm text-gray-600 leading-relaxed pt-3">
                For more information on sizing and how our products may fit you{' '}
                <Link
                  to="/size-guide"
                  className="underline underline-offset-2 hover:text-black"
                >
                  please refer to our sizing page
                </Link>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
