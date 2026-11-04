import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export default function ScanFilm() {
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const film = useRef(null);
  // The film only downloads and plays while it is on screen, to respect mobile data.
  useEffect(() => {
    const video = film.current;
    if (paused || !video) return undefined;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) video.play().catch(() => {}); else video.pause(); }, { threshold: 0.25 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [paused]);
  const toggle = () => { if (!paused) film.current.pause(); setPaused(!paused); };
  return <div className="scan-demo-film"><video ref={film} muted loop playsInline preload="none" poster="/video/scan-story-poster.jpg" aria-label="How Twenty3 works: someone notices your outfit, scans the code on it, lands on your work and can hire you."><source src="/video/scan-story.mp4" type="video/mp4" /></video><button type="button" onClick={toggle} aria-label={paused ? 'Play video' : 'Pause video'}>{paused ? <Play size={15} strokeWidth={1.5} /> : <Pause size={15} strokeWidth={1.5} />}</button></div>;
}
