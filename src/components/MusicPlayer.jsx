import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

// Small background-music toggle that lives in the header.
// The track loops continuously. Browsers refuse to autoplay *audible* sound
// until the visitor interacts with the page, so we:
//   1. start the track the moment the page loads — muted (always allowed),
//   2. un-mute on the first click/tap anywhere on the page (no header click needed),
//   3. if the browser already permits audible autoplay (return visit / installed
//      PWA / relaxed policy) we start with sound straight away.
// The header icon always lets the visitor pause or resume.
export default function MusicPlayer({ className = '' }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  // Attempt to auto-start immediately on load.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Try with sound first.
    audio.muted = false;
    audio.play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Audible autoplay blocked by the browser — fall back to muted so the
        // track is already "playing" the instant the visitor enters.
        audio.muted = true;
        audio.play()
          .then(() => setPlaying(true))
          .catch(() => { /* still blocked — wait for first interaction */ });
      });
  }, []);

  // Un-mute on the first interaction anywhere on the page (header button excluded).
  useEffect(() => {
    const unmute = (e) => {
      if (e.target?.closest && e.target.closest('[data-music-toggle]')) return;
      const audio = audioRef.current;
      if (!audio || userPaused.current) return;
      if (audio.muted) {
        audio.muted = false;
        audio.play()
          .then(() => setPlaying(true))
          .catch(() => {});
      }
    };
    window.addEventListener('pointerdown', unmute, { once: true });
    window.addEventListener('keydown', unmute, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unmute);
      window.removeEventListener('keydown', unmute);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      userPaused.current = true;
      audio.pause();
      setPlaying(false);
    } else {
      userPaused.current = false;
      audio.muted = false;
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  return (
    <>
      {/* hidden looping audio element */}
      <audio
        ref={audioRef}
        src="/music/from-23.mp3"
        loop
        autoPlay
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="hidden"
      />

      <button
        type="button"
        data-music-toggle
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        title={playing ? 'Pause music' : 'Play music'}
        className={`relative transition-colors hover:text-[var(--accent)] ${className}`}
        style={{ lineHeight: 0 }}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </>
  );
}
