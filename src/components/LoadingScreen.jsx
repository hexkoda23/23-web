import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }) {
    const [phase, setPhase] = useState('loading'); // loading, splitting

    useEffect(() => {
        // Prevent scrolling while loading
        document.body.style.overflow = 'hidden';

        // Auto-skip logic if already visited this session
        if (sessionStorage.getItem('f23-loaded')) {
            document.body.style.overflow = 'auto';
            onComplete();
            return;
        }

        sessionStorage.setItem('f23-loaded', 'true');

        // Sequence
        const t1 = setTimeout(() => setPhase('splitting'), 1800);
        const t2 = setTimeout(() => {
            document.body.style.overflow = 'auto';
            onComplete();
        }, 2600);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            document.body.style.overflow = 'auto';
        };
    }, [onComplete]);

    // If already skipped, return nothing immediately
    if (sessionStorage.getItem('f23-loaded') === 'true' && phase === 'loading') {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Top Half Background */}
            <motion.div
                className="absolute top-0 left-0 w-full h-1/2 bg-[#0A0A0A]"
                initial={{ y: 0 }}
                animate={{ y: phase === 'splitting' ? '-100%' : 0 }}
                transition={{ duration: 0.8, ease: [0.85, 0, 0.15, 1] }}
            />

            {/* Bottom Half Background */}
            <motion.div
                className="absolute bottom-0 left-0 w-full h-1/2 bg-[#0A0A0A]"
                initial={{ y: 0 }}
                animate={{ y: phase === 'splitting' ? '100%' : 0 }}
                transition={{ duration: 0.8, ease: [0.85, 0, 0.15, 1] }}
            />

            {/* Content Layer (dissolves as it splits) */}
            <motion.div
                className="absolute inset-0 flex flex-col justify-center items-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: phase === 'splitting' ? 0 : 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex overflow-hidden">
                    {"23".split("").map((letter, i) => (
                        <motion.span
                            key={i}
                            className="text-white font-display font-black uppercase tracking-tight"
                            style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)', lineHeight: 1 }}
                            initial={{ clipPath: 'inset(100% 0 0 0)' }}
                            animate={{ clipPath: 'inset(0% 0 0 0)' }}
                            transition={{ delay: 0.2 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="fixed bottom-12 left-10 right-10 max-w-[300px] mx-auto h-px bg-white/10 overflow-hidden">
                    <motion.div
                        className="h-full bg-[var(--accent)]"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, ease: "linear" }}
                    />
                </div>
            </motion.div>
        </div>
    );
}
