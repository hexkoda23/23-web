import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

const team = [
  {
    name: 'Adeleke Kehinde Boluwatife',
    role: 'Founder & Creative Director',
    bio: 'Turned a bold idea into a personalized luxury brand. With unmatched creativity and a passion for redefining luxury wear, Adeleke sets the standard for style, individuality, and exclusivity.',
  },
  {
    name: 'Ashibogwu Chukwudi Hilary',
    role: 'Brand Manager',
    bio: 'Through strategic brilliance and meticulous attention to detail, Hilary ensures 23 is positioned as the definitive luxury streetwear brand for the modern generation.',
  },
];

const values = [
  { num: '01', title: 'Identity First', body: 'Every piece is designed to express who you are, not just what you wear.' },
  { num: '02', title: 'Exclusivity', body: 'Each item carries a unique barcode. No two pieces are exactly alike.' },
  { num: '03', title: 'Luxury Redefined', body: 'Street culture meets high fashion — crafted for those who refuse to choose.' },
  { num: '04', title: 'Community', body: 'The 23 family celebrates style as identity. You are not alone in this.' },
];

const chapters = [
  {
    year: 'The Spark',
    title: 'A number Lagos whispers',
    body: 'TWENTY3 began as a question asked at 2 AM in Lagos: what if clothing could introduce you before you said a word? Not a logo. Not a slogan. You — your name, your work, your world, carried on the fabric itself.',
  },
  {
    year: 'The Code',
    title: 'The barcode becomes the brand',
    body: 'We stitched the answer into every garment. Each TWENTY3 piece is born with its own barcode, bound to its owner. Scan it with any phone and the clothing speaks — your story, your socials, your portfolio. Strangers stop being strangers.',
  },
  {
    year: 'The Craft',
    title: 'Lagos hands, world standards',
    body: 'Premium cotton, pressed-crease tailoring, colourways named like an archive — The Midnight, The Sapphire, The Panther. Every drop is finite. When a piece sells out, it is gone, and its codes retire with their owners.',
  },
  {
    year: 'The Intelligence',
    title: 'A stylist that knows the catalog',
    body: 'The 23 AI Studio reads the same identity the barcode carries — your palette, your occasions, your budget — and builds real outfits from the live catalog. Try pieces on your own photo before you ever check out.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

function BarcodeStripes({ className = '', bars = 26 }) {
  const widths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3];
  return (
    <div className={`flex items-stretch gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.02, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: widths[i % widths.length], transformOrigin: 'bottom' }}
          className="block h-full bg-current"
        />
      ))}
    </div>
  );
}

export default function About() {
  return (
    <PageTransition>
      <div className="w-full bg-[#0A0A0A]">

        {/* Hero */}
        <section className="relative min-h-[58vh] flex items-end pb-14 px-6 lg:px-16 overflow-hidden">
          <div className="absolute inset-0">
            <motion.img
              src="/lookbook/6.jpg"
              alt="About 23"
              className="w-full h-full object-cover opacity-90 brightness-125"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-[#0A0A0A]" />
          </div>
          <div className="max-w-[1200px] mx-auto w-full relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="section-tag mb-5 text-white/80">Our Story</div>
              <h1 className="font-display text-white leading-[1.02]" style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.6rem)' }}>
                Luxury. <span className="serif-italic" style={{ color: 'var(--gold)' }}>Identity.</span> Exclusivity.
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Manifesto + values */}
        <section className="py-20 bg-[#0A0A0A]">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
              <motion.div {...fadeUp}>
                <div className="section-tag mb-6 text-white/80">What We Believe</div>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  TWENTY3 is luxury personalized for you. Born from the bold spirit of Lagos,
                  we craft exclusive pieces where style meets identity — clothing that carries
                  your story in its thread.
                </p>
                <p className="text-white/45 leading-relaxed mb-6">
                  Every item carries a unique barcode, making it truly yours. Scan any piece
                  and it introduces its owner — because at 23, you don't just wear fashion,
                  you own it, and it knows you back.
                </p>
                <p className="text-white/45 leading-relaxed mb-8">
                  Our designs are a fusion of culture and modern luxury, created for those who
                  value individuality, expression, and exclusivity. From the wide-leg Script
                  Trousers to the archive-named colourways, every drop is finite and every
                  piece is a first edition.
                </p>
                <BarcodeStripes className="h-8 text-white/30" />
              </motion.div>
              <div className="grid grid-cols-1 gap-4">
                {values.map((v, i) => (
                  <motion.div
                    key={v.num}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-dark rounded-xl p-6 hover:border-[var(--accent)]/30 transition-colors"
                  >
                    <div className="flex items-start gap-5">
                      <span className="font-mono text-[0.6rem] text-[var(--accent)] tracking-[0.15em] flex-shrink-0 mt-0.5">{v.num}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-1">{v.title}</h4>
                        <p className="text-white/40 text-sm font-light leading-relaxed">{v.body}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The Barcode chapter */}
        <section className="py-20 bg-[#111111] border-y border-white/[0.06] overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
            <motion.div {...fadeUp} className="max-w-3xl">
              <div className="section-tag mb-5 text-white/80">The Code</div>
              <h2 className="font-display text-white leading-[1.06] mb-8" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}>
                Your clothes <span className="serif-italic" style={{ color: 'var(--gold)' }}>introduce</span> you
              </h2>
              <p className="text-white/55 leading-relaxed mb-5">
                Somewhere in every TWENTY3 piece — along a hem, across a pocket, under a collar —
                lives a barcode that belongs to one person on earth: you. It is not decoration.
                It is a door.
              </p>
              <p className="text-white/45 leading-relaxed mb-5">
                Point any phone camera at it and your world opens: the name you go by, the work
                you are proud of, the socials you actually use. A stranger at a gallery, a
                collaborator at a show, someone across the room who noticed the fit — one scan
                and they've met you properly.
              </p>
              <p className="text-white/45 leading-relaxed">
                And when your chapter changes, the code changes with you. New portfolio, new
                handle, new city — update it anytime. The garment stays the same; the story it
                tells keeps growing. That is what "Wear Your World" means.
              </p>
            </motion.div>

            {/* Chapters timeline */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {chapters.map((chapter, i) => (
                <motion.div
                  key={chapter.year}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t border-white/15 pt-5"
                >
                  <p className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-[var(--accent)]/80 mb-3">{chapter.year}</p>
                  <h3 className="font-display text-white text-xl leading-snug mb-3 normal-case" style={{ textTransform: 'none' }}>{chapter.title}</h3>
                  <p className="text-white/40 text-sm font-light leading-relaxed">{chapter.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-[#0A0A0A]">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-16">
            <motion.div {...fadeUp}>
              <div className="section-tag mb-5 text-white/80">The Team</div>
              <h2 className="font-display text-white leading-[1.05] mb-14" style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)' }}>
                The Minds <span className="serif-italic" style={{ color: 'var(--gold)' }}>Behind</span> 23
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.7 }}
                  className="glass-dark rounded-2xl p-8 hover:border-[var(--accent)]/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mb-6">
                    <span className="font-mono font-bold text-[var(--accent)] text-sm">
                      {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="section-tag text-[var(--accent)] mb-3">{member.role}</div>
                  <h3 className="font-bold text-white text-base mb-4 leading-tight">{member.name}</h3>
                  <p className="text-white/40 text-sm font-light leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#0A0A0A] border-t border-white/[0.06]">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-16 text-center">
            <motion.div {...fadeUp}>
              <div className="section-tag justify-center mb-5 text-white/80">Start Here</div>
              <h2 className="font-display text-white leading-[1.05] mb-8" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
                Wear Your <span className="serif-italic" style={{ color: 'var(--gold)' }}>Identity</span>
              </h2>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-10 py-4 bg-[var(--accent)] text-black font-mono text-[0.62rem] tracking-[0.2em] uppercase font-bold hover:bg-white transition-all duration-300 group"
              >
                Shop Collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
