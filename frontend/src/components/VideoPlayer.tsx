import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { VIDEOS_BASE_URL } from "../constants";
import "./VideoPlayer.css";

interface VideoPlayerProps {
  hlsPath: string | null;
  videoPath: string;
}

export function VideoPlayer({ hlsPath, videoPath }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (hlsPath) {
      const src = `${VIDEOS_BASE_URL}/${hlsPath}`;
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari: native HLS support
        video.src = src;
      }
    } else {
      video.src = `${VIDEOS_BASE_URL}/${videoPath}`;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsPath, videoPath]);

  return (
    <div className="video-player-wrapper">
      <video
        ref={videoRef}
        className="video-player"
        controls
        playsInline
        autoPlay={false}
      />
    </div>
  );
}
