import { useEffect, useRef, useState } from 'react';

// Luxury custom cursor: a solid dot + trailing ring rendered with
// mix-blend-mode:difference so it stays visible on any background
// (white, cream, black, imagery). Position updates run on refs inside
// a single rAF loop — no React re-renders per frame — and hover state
// is re-resolved on scroll so the cursor never gets stuck or lost.
const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, label, [role="button"], [data-cursor]';

export default function CustomCursor() {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const [enabled, setEnabled] = useState(false);
    const [hoverText, setHoverText] = useState('');

    useEffect(() => {
        const isFinePointer = window.matchMedia('(pointer: fine)').matches;
        if (!isFinePointer) return;

        setEnabled(true);
        document.documentElement.classList.add('has-custom-cursor');

        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const ring = { x: pos.x, y: pos.y };
        let visible = false;
        let hovering = false;
        let pressed = false;
        let rafId;

        const dot = dotRef.current;
        const ringEl = ringRef.current;

        const applyState = () => {
            if (!dot || !ringEl) return;
            const dotScale = pressed ? 0.6 : 1;
            const ringScale = pressed ? 0.85 : hovering ? 1.9 : 1;
            dot.style.opacity = visible ? '1' : '0';
            ringEl.style.opacity = visible ? '1' : '0';
            dot.dataset.hovering = hovering ? 'true' : 'false';
            ringEl.dataset.hovering = hovering ? 'true' : 'false';
            dot.style.setProperty('--dot-scale', String(dotScale));
            ringEl.style.setProperty('--ring-scale', String(ringScale));
        };

        const resolveHover = (target) => {
            const el = target?.closest?.(INTERACTIVE_SELECTOR) || null;
            const nextHovering = Boolean(el);
            const nextText = el?.getAttribute?.('data-cursor-text') || el?.closest?.('[data-cursor-text]')?.getAttribute?.('data-cursor-text') || '';
            if (nextHovering !== hovering) {
                hovering = nextHovering;
                applyState();
            }
            setHoverText(nextHovering ? nextText : '');
        };

        const onMouseMove = (e) => {
            pos.x = e.clientX;
            pos.y = e.clientY;
            if (!visible) {
                visible = true;
                ring.x = pos.x;
                ring.y = pos.y;
                applyState();
            }
            resolveHover(e.target);
        };

        // While scrolling the pointer stays still but the page moves under
        // it — recompute what is beneath the cursor so hover styling and the
        // cursor itself stay correct.
        const onScroll = () => {
            if (!visible) return;
            const under = document.elementFromPoint(pos.x, pos.y);
            if (under) resolveHover(under);
        };

        const onMouseDown = () => { pressed = true; applyState(); };
        const onMouseUp = () => { pressed = false; applyState(); };
        const onLeave = () => { visible = false; applyState(); };
        const onEnter = () => { visible = true; applyState(); };

        const loop = () => {
            // Dot follows instantly; ring trails with soft lerp.
            ring.x += (pos.x - ring.x) * 0.16;
            ring.y += (pos.y - ring.y) * 0.16;
            if (dot) dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(var(--dot-scale, 1))`;
            if (ringEl) ringEl.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(var(--ring-scale, 1))`;
            rafId = requestAnimationFrame(loop);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        document.documentElement.addEventListener('mouseleave', onLeave);
        document.documentElement.addEventListener('mouseenter', onEnter);
        rafId = requestAnimationFrame(loop);
        applyState();

        return () => {
            document.documentElement.classList.remove('has-custom-cursor');
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            document.documentElement.removeEventListener('mouseleave', onLeave);
            document.documentElement.removeEventListener('mouseenter', onEnter);
            cancelAnimationFrame(rafId);
        };
    }, []);

    if (!enabled) return null;

    return (
        <>
            <div
                ref={dotRef}
                aria-hidden="true"
                className="fixed top-0 left-0 z-[9999] pointer-events-none rounded-full bg-white"
                style={{
                    width: 8,
                    height: 8,
                    opacity: 0,
                    mixBlendMode: 'difference',
                    transition: 'opacity 0.25s ease',
                    willChange: 'transform',
                }}
            />
            <div
                ref={ringRef}
                aria-hidden="true"
                className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full border border-white flex items-center justify-center"
                style={{
                    width: 36,
                    height: 36,
                    opacity: 0,
                    mixBlendMode: 'difference',
                    transition: 'opacity 0.25s ease, width 0.3s ease, height 0.3s ease',
                    willChange: 'transform',
                }}
            >
                {hoverText && (
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white whitespace-nowrap">
                        {hoverText}
                    </span>
                )}
            </div>
        </>
    );
}
