import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [hoverText, setHoverText] = useState('');
    const [isMobile, setIsMobile] = useState(true); // Default to true to prevent flash on load

    useEffect(() => {
        // Check if it's a touch device
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        if (isMobile) return;

        let requestRef;
        let targetX = -100;
        let targetY = -100;
        let currentX = -100;
        let currentY = -100;

        const onMouseMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        };

        const handleMouseOver = (e) => {
            const el = e.target.closest('a, button, input-[type="submit"], [data-cursor]');
            if (el) {
                setIsHovering(true);
                const text = el.getAttribute('data-cursor-text') || '';
                setHoverText(text);
            } else {
                setIsHovering(false);
                setHoverText('');
            }
        };

        const updateCursor = () => {
            // Linear interpolation for smooth trailing effect
            currentX += (targetX - currentX) * 0.15;
            currentY += (targetY - currentY) * 0.15;

            setMousePosition({ x: currentX, y: currentY });
            requestRef = requestAnimationFrame(updateCursor);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        requestRef = requestAnimationFrame(updateCursor);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            cancelAnimationFrame(requestRef);
        };
    }, [isMobile]);

    if (isMobile) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] flex justify-center items-center"
            animate={{
                x: mousePosition.x,
                y: mousePosition.y,
                width: isHovering ? 50 : 12,
                height: isHovering ? 50 : 12,
                x: isHovering ? mousePosition.x - 25 : mousePosition.x - 6,
                y: isHovering ? mousePosition.y - 25 : mousePosition.y - 6,
                backgroundColor: isHovering ? 'rgba(200, 240, 0, 0.4)' : 'transparent',
                borderColor: isHovering ? 'transparent' : 'var(--accent)',
            }}
            initial={{ width: 12, height: 12 }}
            transition={{ type: 'tween', ease: 'linear', duration: 0 }}
            style={{
                borderWidth: isHovering ? '0px' : '1px',
                borderRadius: '50%',
                willChange: 'transform, width, height'
            }}
        >
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovering && hoverText ? 1 : 0 }}
                className="text-black font-mono text-[9px] uppercase tracking-widest font-bold whitespace-nowrap"
            >
                {hoverText}
            </motion.span>
        </motion.div>
    );
}
