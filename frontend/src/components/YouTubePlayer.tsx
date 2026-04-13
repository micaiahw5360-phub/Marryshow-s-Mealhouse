import React from 'react';

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  autoplay = true,
  muted = false,
  className = '',
}) => {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    controls: '0',              // no play/pause/seek bar
    modestbranding: '1',       // removes YouTube logo (small "YouTube" text remains)
    rel: '0',                  // no related videos at end
    showinfo: '0',             // hides title on some browsers
    iv_load_policy: '3',       // no annotations
    disablekb: '1',            // disable keyboard controls
    fs: '0',                   // disable fullscreen button
    playsinline: '1',          // plays inline on mobile
  });

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;

  return (
    <div className={`relative w-full aspect-video ${className}`}>
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={false}
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
        style={{ pointerEvents: 'none' }}   // ← disables all hover/click UI
      />
    </div>
  );
};