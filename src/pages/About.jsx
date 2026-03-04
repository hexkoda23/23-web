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
  {
    name: 'Christiana Obidare',
    role: 'Social Media Manager',
    bio: 'Bringing the brand to life in the digital world. With exceptional creativity and deep community engagement, she transforms every post into an experience that connects and inspires.',
  },
];

const values = [
  { num: '01', title: 'Identity First', body: 'Every piece is designed to express who you are, not just what you wear.' },
  { num: '02', title: 'Exclusivity', body: 'Each item carries a unique barcode. No two pieces are exactly alike.' },
  { num: '03', title: 'Luxury Redefined', body: 'Street culture meets high fashion — crafted for those who refuse to choose.' },
  { num: '04', title: 'Community', body: 'The 23 family celebrates style as identity. You are not alone in this.' },
];

export default function About() {
  return (
    <PageTransition>
      <div className="w-full bg-[#0A0A0A]">

        {/* Dark hero header */}
        <section className="relative min-h-[70vh] flex items-end pb-20 px-6 lg:px-16 overflow-hidden">
          <div className="absolute inset-0">
            <img src="/lookbook/6.jpg" alt="About 23" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0A0A0A]" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="max-w-[1400px] mx-auto w-full relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="section-tag mb-6">Our Story</div>
              <h1
                className="font-black text-white uppercase leading-[0.9] tracking-[-0.03em]"
                style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
              >
                Luxury.<br />
                <span style={{ color: 'var(--accent)' }}>Identity.</span><br />
                Exclusivity.
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Brand manifesto */}
        <section className="py-24 bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="section-tag mb-6">What We Believe</div>
                <p className="text-white/60 text-lg leading-relaxed font-light mb-6">
                  23 is luxury personalized for you. Born from the bold spirit of Lagos, we craft exclusive pieces where style meets identity.
                </p>
                <p className="text-white/40 leading-relaxed font-light mb-6">
                  Every item carries a unique barcode, making it truly yours — because at 23, you don't just wear fashion, you own it.
                </p>
                <p className="text-white/40 leading-relaxed font-light">
                  Our designs are a fusion of culture and modern luxury, created for those who value individuality, expression, and exclusivity.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {values.map((v, i) => (
                  <motion.div
                    key={v.num}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
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

        {/* Team — THCO "World Class Talent" section */}
        <section className="py-24 bg-[#111111] border-t border-white/[0.06]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
            <div className="section-tag mb-6">The Team</div>
            <h2
              className="font-black text-white uppercase leading-[0.95] tracking-[-0.02em] mb-16"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
            >
              The Minds<br />Behind 23
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
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
        <section className="py-20 bg-[#0A0A0A] border-t border-white/[0.06]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16 text-center">
            <div className="section-tag justify-center mb-5">Start Here</div>
            <h2 className="font-black text-white uppercase text-4xl lg:text-6xl leading-tight tracking-tight mb-8">
              Wear Your Identity
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[var(--accent)] text-black font-mono text-[0.62rem] tracking-[0.2em] uppercase font-bold hover:bg-white transition-all duration-300 group"
            >
              Shop Collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
