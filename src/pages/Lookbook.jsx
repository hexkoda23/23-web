import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

const IMAGES = Array.from({ length: 20 }, (_, i) => `/lookbook/${i + 1}.jpg`);

export default function Lookbook() {
  return (
    <PageTransition>
      <div className="w-full bg-[#0A0A0A] pt-28 pb-24 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

          {/* Header */}
          <div className="mb-16">
            <div className="section-tag mb-5">Visual Archive</div>
            <h1
              className="font-black text-white uppercase leading-[0.9] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            >
              Lookbook
            </h1>
          </div>

          {/* Masonry-style grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {IMAGES.map((src, idx) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: (idx % 6) * 0.08 }}
                className="editorial-card break-inside-avoid group"
              >
                <img
                  src={src}
                  alt={`Look ${idx + 1}`}
                  className="w-full block"
                />
                <div className="overlay" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="font-mono text-[0.58rem] tracking-[0.18em] uppercase text-white/70">
                    Look {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
