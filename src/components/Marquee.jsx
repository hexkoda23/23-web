import { memo, useState } from 'react';

const Marquee = memo(({ text, children, speed = '25s', reverse = false, className = '', pauseOnHover = false }) => {
    // Determine the base speed in seconds to allow multiplication
    const speedSeconds = parseFloat(speed) || 25;
    const [isFast, setIsFast] = useState(false);

    // Dynamic speed based on tap state
    const currentSpeed = isFast ? `${speedSeconds * 0.3}s` : speed;

    // Creating an array of text strings if 'text' is provided, otherwise wrap children
    const content = children ? children : Array(8).fill(text).map((item, i) => (
        <span key={i} className="px-4 flex-shrink-0 whitespace-nowrap">
            {item}
        </span>
    ));

    return (
        <div
            className={`overflow-hidden flex whitespace-nowrap w-full ${className} ${pauseOnHover && !isFast ? 'hover:[.marquee-track]:[animation-play-state:paused]' : ''}`}
            onPointerDown={() => setIsFast(true)}
            onPointerUp={() => setIsFast(false)}
            onPointerLeave={() => setIsFast(false)}
        >
            <div
                className="marquee-track flex items-center min-w-[200%]"
                style={{
                    animationDirection: reverse ? 'reverse' : 'normal',
                    animationDuration: currentSpeed,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite'
                }}
            >
                {/* 1st set */}
                <div className="flex w-1/2 justify-around shrink-0">
                    {content}
                </div>
                {/* 2nd set for seamless -50% translation */}
                <div className="flex w-1/2 justify-around shrink-0">
                    {content}
                </div>
            </div>
        </div>
    );
});

export default Marquee;
