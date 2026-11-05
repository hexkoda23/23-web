import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const BARS = Array.from({ length: 48 }, (_, i) => 22 + 70 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .53 + 1)));
const clock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function SongPlayer({ file, artist }) {
  const song = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [failed, setFailed] = useState(false);
  const title = (file.name || 'Song').replace(/\.[^.]+$/, '');
  const toggle = () => {
    if (!song.current.paused) { song.current.pause(); return; }
    // Only one song plays at a time on a profile.
    document.querySelectorAll('audio').forEach(other => { if (other !== song.current) other.pause(); });
    song.current.play().catch(() => setFailed(true));
  };
  const seek = event => { song.current.currentTime = Number(event.target.value); setTime(Number(event.target.value)); };
  if (failed) return <a href={file.url} target="_blank" rel="noopener noreferrer" className="block p-5 border border-gray-800 bg-neutral-900 rounded-lg text-sm underline">{title}</a>;
  return <div className="p-5 border border-gray-800 bg-neutral-900 rounded-lg">
    <audio ref={song} src={file.url} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={event => setTime(event.target.currentTime)} onLoadedMetadata={event => setLength(event.target.duration)} onError={() => setFailed(true)} />
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0"><p className="font-medium truncate">{title}</p>{artist && <p className="text-sm text-gray-400 truncate">{artist}</p>}</div>
      <button type="button" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${title}`} className="w-12 h-12 flex-none flex items-center justify-center rounded-full bg-white text-black">{playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button>
    </div>
    <div className="relative mt-4 h-12 flex items-center gap-[2px]">
      {BARS.map((height, i) => <i key={i} className={`flex-1 rounded-sm ${length && i / BARS.length < time / length ? 'bg-white' : 'bg-neutral-600'}`} style={{ height: `${height}%` }} />)}
      <input type="range" min="0" max={length || 0} step="0.1" value={time} onChange={seek} aria-label={`Seek through ${title}`} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
    </div>
    <div className="mt-2 flex justify-between text-xs text-gray-400"><span>{clock(time)}</span><span>{length ? clock(length) : '--:--'}</span></div>
  </div>;
}
