// src/components/YouTubePlayer.tsx
import React from 'react';

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  autoplay = false,
  className = '',
}) => {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: '1',              // show play/pause/seek bar
    modestbranding: '1',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    disablekb: '0',             // enable keyboard controls
    fs: '1',                    // allow fullscreen
    playsinline: '1',
  });

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;

  return (
    <div className={`relative w-full aspect-video ${className}`}>
      <iframe
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
      />
    </div>
  );
};