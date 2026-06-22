import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { VIDEOS_BASE_URL } from "../constants";
import { getProgress, updateProgress } from "../api/history";
import "./VideoPlayer.css";

interface VideoPlayerProps {
  videoId?: string;
  hlsPath: string | null;
  videoPath: string;
}

interface QualityLevel {
  index: number;
  label: string;
  bitrate: number;
}

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ videoId, hlsPath, videoPath }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [pip, setPip] = useState(false);

  // Quality selection
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto ABR
  const [autoPlayingLevel, setAutoPlayingLevel] = useState<number | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!draggingRef.current) setShowControls(false);
    }, 3000);
  }, []);

  // Load HLS or plain source
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    hlsRef.current?.destroy();
    hlsRef.current = null;
    setQualityLevels([]);
    setCurrentQuality(-1);
    setAutoPlayingLevel(null);

    if (hlsPath) {
      const src = `${VIDEOS_BASE_URL}/${hlsPath}`;
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(src);
        hls.attachMedia(video);

        // Expose quality levels once manifest is parsed
        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          const levels: QualityLevel[] = data.levels.map((l, i) => ({
            index: i,
            label: l.height ? `${l.height}p` : `${Math.round(l.bitrate / 1000)} kbps`,
            bitrate: l.bitrate,
          }));
          setQualityLevels(levels);
          setCurrentQuality(-1); // Start on auto
        });

        // Track which level is actually playing (for "Auto · 720p" display)
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          if (hls.autoLevelEnabled) setAutoPlayingLevel(data.level);
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS — no quality API available
        video.src = src;
      }
    } else {
      video.src = `${VIDEOS_BASE_URL}/${videoPath}`;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [hlsPath, videoPath]);

  // Wire up video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0)
        setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onDuration = () => setDuration(video.duration);
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onVolumeChange = () => { setVolume(video.volume); setMuted(video.muted); };
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    const onPipEnter = () => setPip(true);
    const onPipLeave = () => setPip(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDuration);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("volumechange", onVolumeChange);
    video.addEventListener("enterpictureinpicture", onPipEnter);
    video.addEventListener("leavepictureinpicture", onPipLeave);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDuration);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("volumechange", onVolumeChange);
      video.removeEventListener("enterpictureinpicture", onPipEnter);
      video.removeEventListener("leavepictureinpicture", onPipLeave);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, []);

  // Restore & save watch progress
  useEffect(() => {
    const video = videoRef.current;
    if (!videoId || !video) return;

    let mounted = true;
    getProgress(videoId).then((prog) => {
      if (mounted && prog > 0 && video) video.currentTime = prog;
    }).catch(() => {});

    const interval = setInterval(() => {
      if (video && !video.paused && video.currentTime > 0)
        updateProgress(videoId, video.currentTime).catch(() => {});
    }, 10000);

    return () => { mounted = false; clearInterval(interval); };
  }, [videoId]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const video = videoRef.current;
      if (!video) return;

      switch (e.code) {
        case "Space": case "KeyK":
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(video.currentTime - 10, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(video.volume + 0.1, 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(video.volume - 0.1, 0);
          break;
        case "KeyM":
          video.muted = !video.muted;
          break;
        case "KeyF":
          toggleFullscreen();
          break;
      }
      resetHideTimer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetHideTimer]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    video.muted = val === 0;
  };

  const toggleFullscreen = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (!document.fullscreenElement) wrapper.requestFullscreen();
    else document.exitFullscreen();
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await video.requestPictureInPicture();
  };

  const handleSpeedChange = (s: number) => {
    const video = videoRef.current;
    if (video) video.playbackRate = s;
    setSpeed(s);
    setShowSpeedMenu(false);
  };

  const handleQualityChange = (levelIndex: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = levelIndex; // -1 = auto ABR, 0+ = fixed level
    if (levelIndex !== -1) setAutoPlayingLevel(null);
    setCurrentQuality(levelIndex);
    setShowQualityMenu(false);
  };

  const seekByRatio = (clientX: number) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    seekByRatio(e.clientX);

    const onMove = (ev: MouseEvent) => seekByRatio(ev.clientX);
    const onUp = () => {
      draggingRef.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  // Quality button label: "Auto · 720p" when ABR has chosen a level
  const qualityLabel =
    currentQuality === -1
      ? autoPlayingLevel !== null && qualityLevels[autoPlayingLevel]
        ? `Auto · ${qualityLevels[autoPlayingLevel].label}`
        : "Auto"
      : (qualityLevels[currentQuality]?.label ?? "Auto");

  return (
    <div
      ref={wrapperRef}
      className={`vp-wrapper${showControls || !playing ? " vp-controls-visible" : ""}`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
    >
      <video
        ref={videoRef}
        className="vp-video"
        playsInline
        onClick={togglePlay}
      />

      {/* Buffering indicator */}
      {buffering && (
        <div className="vp-buffering">
          <div className="vp-spinner" />
        </div>
      )}

      <div className="vp-gradient-top" />

      {/* Controls */}
      <div className="vp-controls" onClick={(e) => e.stopPropagation()}>
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="vp-progress"
          onMouseDown={handleProgressMouseDown}
        >
          <div className="vp-track">
            <div className="vp-track-buffered" style={{ width: `${bufferedPct}%` }} />
            <div className="vp-track-played" style={{ width: `${progressPct}%` }}>
              <div className="vp-thumb" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="vp-bar">
          <div className="vp-bar-left">
            {/* Play / Pause */}
            <button className="vp-btn" onClick={togglePlay} aria-label={playing ? "Pause" : "Lecture"}>
              {playing ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v13.72a1 1 0 001.51.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
                </svg>
              )}
            </button>

            {/* Volume */}
            <div className="vp-volume-group">
              <button className="vp-btn" onClick={toggleMute} aria-label={muted ? "Activer le son" : "Couper le son"}>
                {muted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 12A4.5 4.5 0 0016 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                className="vp-volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
              />
            </div>

            {/* Time */}
            <span className="vp-time">
              {formatTime(currentTime)}<span className="vp-time-sep"> / </span>{formatTime(duration)}
            </span>
          </div>

          <div className="vp-bar-right">
            {/* Quality selector — only shown for HLS streams with multiple levels */}
            {qualityLevels.length > 1 && (
              <div className="vp-quality-wrap">
                <button
                  className="vp-btn vp-text-btn"
                  onClick={() => { setShowQualityMenu((v) => !v); setShowSpeedMenu(false); }}
                  aria-label="Qualité vidéo"
                >
                  {qualityLabel}
                </button>
                {showQualityMenu && (
                  <>
                    <div className="vp-backdrop" onClick={() => setShowQualityMenu(false)} />
                    <div className="vp-popup-menu">
                      <div className="vp-menu-label">Qualité</div>
                      <button
                        className={`vp-menu-opt${currentQuality === -1 ? " active" : ""}`}
                        onClick={() => handleQualityChange(-1)}
                      >
                        Auto
                        {currentQuality === -1 && autoPlayingLevel !== null && qualityLevels[autoPlayingLevel] && (
                          <span className="vp-menu-sub">{qualityLevels[autoPlayingLevel].label}</span>
                        )}
                      </button>
                      {qualityLevels.map((q) => (
                        <button
                          key={q.index}
                          className={`vp-menu-opt${currentQuality === q.index ? " active" : ""}`}
                          onClick={() => handleQualityChange(q.index)}
                        >
                          {q.label}
                          <span className="vp-menu-sub">{Math.round(q.bitrate / 1000)} kbps</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Speed */}
            <div className="vp-speed-wrap">
              <button
                className="vp-btn vp-text-btn"
                onClick={() => { setShowSpeedMenu((v) => !v); setShowQualityMenu(false); }}
                aria-label="Vitesse de lecture"
              >
                {speed === 1 ? "1×" : `${speed}×`}
              </button>
              {showSpeedMenu && (
                <>
                  <div className="vp-backdrop" onClick={() => setShowSpeedMenu(false)} />
                  <div className="vp-popup-menu">
                    <div className="vp-menu-label">Vitesse</div>
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        className={`vp-menu-opt${s === speed ? " active" : ""}`}
                        onClick={() => handleSpeedChange(s)}
                      >
                        {s === 1 ? "Normal" : `${s}×`}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Picture-in-Picture */}
            {"pictureInPictureEnabled" in document && (
              <button
                className={`vp-btn${pip ? " vp-btn--active" : ""}`}
                onClick={togglePip}
                aria-label="Picture-in-Picture"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3C1.9 3 1 3.88 1 4.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z" />
                </svg>
              </button>
            )}

            {/* Fullscreen */}
            <button className="vp-btn" onClick={toggleFullscreen} aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}>
              {fullscreen ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="vp-shortcuts-hint" aria-hidden>
        <span>Espace · ← → · ↑↓ vol · M · F</span>
      </div>
    </div>
  );
}
